import {Contract} from '@ethersproject/contracts'
import {BigNumber} from 'ethers'
import {bytes32toString, identifierMatcher, parseIdentifier, strip0x} from '../tool/string'
import {NullAddress} from '../model/Constant'
import {
    DelegateType,
    DIDAttributeChanged,
    DIDDelegateChanged,
    DidEventName,
    DIDOwnerChanged,
    Erc1056Event,
    isEvent,
    legacyAlgoMap,
    legacyAttrTypes,
    LegacyVerificationMethod,
    VerificationMethodType
} from '../model/Erc1056Event'
import {Block, Log} from '@ethersproject/providers'
import {LogDescription} from '@ethersproject/abi'
import {
    DIDDocument,
    DIDResolutionOptions,
    DIDResolutionResult,
    parse,
    Resolvable,
    Service,
    VerificationMethod
} from 'did-resolver'
import {Exception} from '../tool/Exception'
import {IdentityAddress} from '../model/BlockAddress';
import {Base58} from '@ethersproject/basex';


export class Resolver implements Resolvable {
    contract: Contract

    constructor(contract: Contract) {
        this.contract = contract
    }

    async previousChange(address: string, blockTag?: string | number): Promise<BigNumber> {
        const result = await this.contract.functions.changed(address, {blockTag})
        return BigNumber.from(result['0'])
    }

    async getBlockMetadata(blockHeight: number): Promise<{ height: string; isoDate: string }> {
        const block: Block = await this.contract.provider.getBlock(blockHeight)
        return {
            height: block.number.toString(),
            isoDate: new Date(block.timestamp * 1000).toISOString().replace('.000', ''),
        }
    }

    async historyChange(address: string, blockTag = 'latest'): Promise<Erc1056Event[]> {
        const history: Erc1056Event[] = []
        let previousChange: BigNumber | null = await this.previousChange(address, blockTag)
        while (previousChange) {
            const blockNumber = previousChange
            const logs = await this.contract.provider.getLogs({
                address: this.contract.address,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                topics: [null as any, `0x000000000000000000000000${address.slice(2)}`],
                fromBlock: previousChange.toHexString(),
                toBlock: previousChange.toHexString(),
            })

            const events: Erc1056Event[] = logs.map((log: Log) => this.convert(this.contract.interface.parseLog(log), log.blockNumber))
            events.reverse()
            previousChange = null
            for (const event of events) {
                history.unshift(event)
                if (event.previousChange.lt(blockNumber)) {
                    previousChange = event.previousChange
                }
            }
        }

        return history
    }

    convert(description: LogDescription, blockNumber: number): Erc1056Event {
        if (description.eventFragment.inputs.length !== description.args.length) {
            throw new TypeError('malformed event input. wrong number of arguments')
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: Record<string, any> = {}
        description.eventFragment.inputs.forEach((input, index) => {
            let value = description.args[index]
            if (typeof value === 'object') value = BigNumber.from(value)
            if (input.type === 'bytes32') value = bytes32toString(value)
            result[input.name] = value
        })

        result.eventName = description.name
        result.blockNumber = blockNumber
        return result as Erc1056Event
    }

    async resolve(identifier: string, options: DIDResolutionOptions = {}): Promise<DIDResolutionResult> {
        const parseDid = parse(identifier)

        if (parseDid === null) {
            throw new Error(Exception.InvalidDid)
        }

        const fullId = parseDid.id.match(identifierMatcher)
        if (!fullId) {
            return {
                didResolutionMetadata: {error: Exception.InvalidDid, message: `Not a valid did: ${parseDid.id}`},
                didDocumentMetadata: {},
                didDocument: null,
            }
        }

        let blockTag: string | number = options.blockTag || 'latest'
        if (typeof parseDid.query === 'string') {
            const qParams = new URLSearchParams(parseDid.query)
            blockTag = qParams.get('versionId') ?? blockTag
            try {
                blockTag = Number.parseInt(<string>blockTag)
            } catch (e) {
                // invalid versionId parameters are ignored
                blockTag = 'latest'
            }
        }

        let now = BigNumber.from(Math.floor(new Date().getTime() / 1000))

        if (typeof blockTag === 'number') {
            const block = await this.getBlockMetadata(blockTag)
            now = BigNumber.from(Date.parse(block.isoDate) / 1000)
        } else {
            // 'latest'
        }

        const identityAddress = parseIdentifier(identifier)
        const history = await this.historyChange(identityAddress.address, 'latest')
        try {
            const {
                didDocument,
                deactivated,
                versionId,
                nextVersionId
            } = this.wrap(identityAddress, history, blockTag, now)
            const status = deactivated ? {deactivated: true} : {}
            let versionMeta = {}
            let versionMetaNext = {}
            if (versionId !== 0) {
                const block = await this.getBlockMetadata(versionId)
                versionMeta = {versionId: block.height, updated: block.isoDate,}
            }

            if (nextVersionId !== Number.POSITIVE_INFINITY) {
                const block = await this.getBlockMetadata(nextVersionId)
                versionMetaNext = {nextVersionId: block.height, nextUpdate: block.isoDate}
            }

            return {
                didDocumentMetadata: {...status, ...versionMeta, ...versionMetaNext},
                didResolutionMetadata: {contentType: 'application/did+ld+json'},
                didDocument,
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            return {
                didResolutionMetadata: {
                    error: Exception.NotFound,
                    message: e.toString(), // This is not in spec, nut may be helpful
                },
                didDocumentMetadata: {},
                didDocument: null,
            }
        }
    }


    wrap(identityAddress: IdentityAddress, history: Erc1056Event[], blockHeight: string | number, now: BigNumber): { didDocument: DIDDocument; deactivated: boolean; versionId: number; nextVersionId: number } {
        const baseDIDDocument: DIDDocument = {
            '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1recovery-2020/v2'],
            id: identityAddress.identifier,
            verificationMethod: [],
            authentication: [],
            assertionMethod: [],
        }

        let controller = identityAddress.address
        const authentication = [`${identityAddress.identifier}#controller`]
        const keyAgreement: string[] = []

        let versionId = 0
        let nextVersionId = Number.POSITIVE_INFINITY
        let deactivated = false
        let delegateCount = 0
        let serviceCount = 0
        let endpoint = ''
        const auth: Record<string, string> = {}
        const keyAgreementRefs: Record<string, string> = {}
        const pks: Record<string, VerificationMethod> = {}
        const services: Record<string, Service> = {}
        for (const event of history) {
            if (blockHeight !== -1 && event.blockNumber > blockHeight) {
                if (nextVersionId > event.blockNumber) {
                    nextVersionId = event.blockNumber
                }
                continue
            } else {
                if (versionId < event.blockNumber) {
                    versionId = event.blockNumber
                }
            }

            const validTo = event.validTo || BigNumber.from(0)
            const eventIndex = `${event.eventName}-${(<DIDDelegateChanged>event).delegateType || (<DIDAttributeChanged>event).name}-${(<DIDDelegateChanged>event).delegate || (<DIDAttributeChanged>event).value}`
            if (validTo && validTo.gte(now)) {
                if (isEvent(event.eventName, [DidEventName.DidDelegateChanged])) {
                    const currentEvent = <DIDDelegateChanged>event
                    delegateCount++
                    switch (currentEvent.delegateType) {
                        case DelegateType.SignAuth:
                            auth[eventIndex] = `${identityAddress.identifier}#delegate-${delegateCount}`
                        case DelegateType.VerifyKey:
                            pks[eventIndex] = {
                                id: `${identityAddress.identifier}#delegate-${delegateCount}`,
                                type: VerificationMethodType.EcdsaSecp256k1RecoveryMethod2020,
                                controller: identityAddress.identifier,
                                blockchainAccountId: `eip155:${identityAddress.networkType}:${currentEvent.delegate}`,
                            }
                            break
                    }
                } else if (isEvent(event.eventName, [DidEventName.DidAttributeChanged])) {
                    const currentEvent = <DIDAttributeChanged>event
                    const name = currentEvent.name //conversion from bytes32 is done in logParser
                    const match = name.match(/^did\/(pub|svc)\/(\w+)(\/(\w+))?(\/(\w+))?$/)
                    if (match) {
                        const section = match[1]
                        const algorithm = match[2]
                        const type = legacyAttrTypes[match[4]] || match[4]
                        const encoding = match[6]
                        switch (section) {
                            case 'pub': {
                                delegateCount++
                                const pk: LegacyVerificationMethod = {
                                    id: `${identityAddress.identifier}#delegate-${delegateCount}`,
                                    type: `${algorithm}${type}`,
                                    controller: identityAddress.identifier,
                                }
                                pk.type = legacyAlgoMap[pk.type] || algorithm
                                switch (encoding) {
                                    case null:
                                    case undefined:
                                    case 'hex':
                                        pk.publicKeyHex = strip0x(currentEvent.value)
                                        break
                                    case 'base64':
                                        pk.publicKeyBase64 = Buffer.from(currentEvent.value.slice(2), 'hex').toString('base64')
                                        break
                                    case 'base58':
                                        pk.publicKeyBase58 = Base58.encode(Buffer.from(currentEvent.value.slice(2), 'hex'))
                                        break
                                    case 'pem':
                                        pk.publicKeyPem = Buffer.from(currentEvent.value.slice(2), 'hex').toString()
                                        break
                                    default:
                                        pk.value = strip0x(currentEvent.value)
                                }

                                pks[eventIndex] = pk
                                if (match[4] === DelegateType.SignAuth) {
                                    auth[eventIndex] = pk.id
                                } else if (match[4] === DelegateType.Enc) {
                                    keyAgreementRefs[eventIndex] = pk.id
                                }
                                break
                            }
                            case 'svc': {
                                serviceCount++
                                try {
                                    endpoint = JSON.parse(Buffer.from(currentEvent.value.slice(2), 'hex').toString())
                                } catch {
                                    endpoint = Buffer.from(currentEvent.value.slice(2), 'hex').toString()
                                }
                                services[eventIndex] = {
                                    id: `${identityAddress.identifier}#service-${serviceCount}`,
                                    type: algorithm,
                                    serviceEndpoint: endpoint,
                                }
                                break
                            }
                        }
                    }
                }
            } else if (isEvent(event.eventName, [DidEventName.DidOwnerChanged])) {
                const currentEvent = <DIDOwnerChanged>event
                controller = currentEvent.owner
                if (currentEvent.owner === NullAddress) {
                    deactivated = true
                    break
                }
            } else {
                if (isEvent(event.eventName, [DidEventName.DidDelegateChanged]) || (isEvent(event.eventName, [DidEventName.DidAttributeChanged])
                    && (<DIDAttributeChanged>event).name.match(/^did\/pub\//))) {
                    delegateCount++
                } else if (isEvent(event.eventName, [DidEventName.DidAttributeChanged]) && (<DIDAttributeChanged>event).name.match(/^did\/svc\//)) {
                    serviceCount++
                }
                delete auth[eventIndex]
                delete pks[eventIndex]
                delete services[eventIndex]
            }
        }

        const publicKeys: VerificationMethod[] = [
            {
                id: `${identityAddress.identifier}#controller`,
                type: VerificationMethodType.EcdsaSecp256k1RecoveryMethod2020,
                controller: identityAddress.identifier,
                blockchainAccountId: `eip155:${identityAddress.networkType}:${controller}`,
            },
        ]

        if (controller === identityAddress.address) {
            publicKeys.push({
                id: `${identityAddress.identifier}#controllerKey`,
                type: VerificationMethodType.EcdsaSecp256k1RecoveryMethod2020,
                controller: identityAddress.identifier,
                publicKeyHex: strip0x(identityAddress.publicKey),
            })
            authentication.push(`${identityAddress.identifier}#controllerKey`)
        }

        const didDocument: DIDDocument = {
            ...baseDIDDocument,
            verificationMethod: publicKeys.concat(Object.values(pks)),
            authentication: authentication.concat(Object.values(auth)),
        }

        if (Object.values(services).length > 0) {
            didDocument.service = Object.values(services)
        }
        if (Object.values(keyAgreementRefs).length > 0) {
            didDocument.keyAgreement = keyAgreement.concat(Object.values(keyAgreementRefs))
        }
        didDocument.assertionMethod = [...(didDocument.verificationMethod?.map((pk) => pk.id) || [])]

        return deactivated ? {
            didDocument: {...baseDIDDocument, '@context': 'https://www.w3.org/ns/did/v1'},
            deactivated,
            versionId,
            nextVersionId,
        } : {didDocument, deactivated, versionId, nextVersionId}
    }
}