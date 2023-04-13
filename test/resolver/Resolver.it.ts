import {BlockAddress} from '../../src/model/BlockAddress'
import {Controller} from '../../src/contract/Controller'
import {Blockchain} from '../../src/contract/Blockchain'
import {DelegateType} from '../../src/model/Erc1056Event'
import {SigningKey} from '@ethersproject/signing-key'
import {Resolver} from '../../src/resolver/Resolver'
import {sleep} from '../../src/tool/common'
import {ProviderType} from "../../src/model/Constant";

jest.setTimeout(600000)

describe('Did resolver', function () {
    let account: BlockAddress

    beforeAll(() => {
        account = {
            address: '0xB49Fedf23ccdB02C84A1649A4e44929Add12e977',
            privateKey: '0xbe7798130f32c0d4c611e64b3e3892adfee1e1d0c1035b8899c6ae3401c3ac4c',
            publicKey: '0x03fb9ae91136a0f31847b3559f7f7563f6a527fd76187f26a2c5c1591ddea16233',
            identifier: 'did:ethr:0x7e4:0x03fb9ae91136a0f31847b3559f7f7563f6a527fd76187f26a2c5c1591ddea16233'
        }
    })

    describe('Change publicKey', () => {
        it('Add EcdsaSecp256k1VerificationKey2019', async () => {

            const contract = Blockchain.getDefaultContract(Blockchain.getDefaultSigner(account.privateKey))
            const controller = new Controller(account.identifier, contract)
            await controller.setAttribute(
                'did/pub/EcdsaSecp256k1/verifyKey',
                '0x02323c30de767f084ce3080168ee293053ba33b235d7116a3263d29f1450936b71',
                86401
            )

            const {didDocument} = await new Resolver(contract).resolve(account.identifier)
            console.log(`${JSON.stringify(didDocument)}`)
            expect(didDocument !== null).toBeTruthy()
            expect(didDocument?.verificationMethod).toBeDefined()
            if (didDocument !== null && didDocument.verificationMethod !== undefined) {
                const verificationMethod = didDocument.verificationMethod.find(
                    e => e.publicKeyHex === '02323c30de767f084ce3080168ee293053ba33b235d7116a3263d29f1450936b71')
                expect(verificationMethod).toEqual({
                    type: expect.anything(),
                    controller: account.identifier,
                    publicKeyHex: '02323c30de767f084ce3080168ee293053ba33b235d7116a3263d29f1450936b71',
                    id: expect.anything()
                })
            }
        })
    })

    describe('Change attribute', () => {
        it('Set attribute signed', async () => {
            const contract = Blockchain.getDefaultContract(Blockchain.getDefaultSigner(account.privateKey))
            const controller = new Controller(account.identifier, contract)

            const serviceEndpointParams = {uri: 'https://yeying.example.com', transportType: 'http'}
            const attributeName = 'did/svc/testService'
            const attributeValue = JSON.stringify(serviceEndpointParams)
            const attributeExpiration = 86400

            const hash = await controller.createSetAttributeHash(attributeName, attributeValue, attributeExpiration)
            const signature = new SigningKey(account.privateKey).signDigest(hash)
            const blockHeightBeforeChange = (await Blockchain.getDefaultProvider(ProviderType.ipc).getBlock('latest')).number

            await controller.setAttributeSigned(attributeName, attributeValue, attributeExpiration,
                {
                    sigV: signature.v,
                    sigR: signature.r,
                    sigS: signature.s
                }
            )

            // Wait for the event to be emitted
            await sleep(1000)

            const result = await new Resolver(contract).resolve(account.identifier)
            console.log(`${JSON.stringify(result)}`)

            expect(Number(result.didDocumentMetadata.versionId)).toBeGreaterThanOrEqual(blockHeightBeforeChange + 1)
            expect(result.didDocument?.id).toBe(account.identifier)
            let count = result.didDocument?.service?.length
            expect(count).toBeDefined()
            if (count === undefined) {
                count = 0
            }

            expect(result.didDocument?.service?.at(count - 1)?.type).toBe('testService')

            let serviceEndpoint = result.didDocument?.service?.at(count - 1)?.serviceEndpoint
            expect(serviceEndpoint).toBeDefined()

            if (serviceEndpoint instanceof Array) {
                serviceEndpoint = serviceEndpoint.at(serviceEndpoint.length - 1)
            }

            expect(serviceEndpoint).toEqual({
                uri: serviceEndpointParams.uri,
                transportType: serviceEndpointParams.transportType
            })
        })
        it('Revoke attribute', async () => {
            const contract = Blockchain.getDefaultContract(Blockchain.getDefaultSigner(account.privateKey))
            const controller = new Controller(account.identifier, contract)

            const serviceEndpointParams = {uri: 'https://yeying.example1.com', transportType: 'http'}
            const attributeName = 'did/svc/testNoSignedService'
            const attributeValue = JSON.stringify(serviceEndpointParams)
            const attributeExpiration = 86400

            const blockHeightBeforeChange = (await Blockchain.getDefaultProvider(ProviderType.ipc).getBlock('latest')).number
            console.log(`Current height=${blockHeightBeforeChange}`)

            await controller.setAttribute(attributeName, attributeValue, attributeExpiration)
            const hash = await controller.createRevokeAttributeHash(attributeName, attributeValue)

            const signature = new SigningKey(account.privateKey).signDigest(hash)


            await controller.revokeAttributeSigned(attributeName, attributeValue,
                {
                    sigV: signature.v,
                    sigR: signature.r,
                    sigS: signature.s
                }
            )

            // Wait for the event to be emitted
            await sleep(1000)

            const result = await new Resolver(contract).resolve(account.identifier)
            console.log(`revoke attribute result=${JSON.stringify(result)}`)

            expect(Number(result.didDocumentMetadata.versionId)).toBeGreaterThanOrEqual(blockHeightBeforeChange + 2)
            expect(result.didDocument?.id).toBe(account.identifier)
            let count = result.didDocument?.service?.length
            expect(count).toBeDefined()
            if (count === undefined) {
                return
            }

            expect(result.didDocument?.service?.find(s => s.type === 'testNoSignedService')).toBeFalsy()
        })
    })

    describe('Change delegate', () => {
        it('Add delegate signed', async () => {
            const delegate = Blockchain.createBlockAddress()
            console.log(`new delegate=${JSON.stringify(delegate)}`)
            const contract = Blockchain.getDefaultContract(Blockchain.getDefaultSigner(account.privateKey))
            const controller = new Controller(account.identifier, contract)
            const hash = await controller.createAddDelegateHash(DelegateType.SignAuth, delegate.address, 86400)
            const signature = new SigningKey(account.privateKey).signDigest(hash)
            const blockHeightBeforeChange = (await Blockchain.getDefaultProvider(ProviderType.ipc).getBlock('latest')).number
            console.log(`Current height=${blockHeightBeforeChange}`)

            await controller.addDelegateSigned(
                DelegateType.SignAuth,
                delegate.address,
                86400,
                {
                    sigV: signature.v,
                    sigR: signature.r,
                    sigS: signature.s
                }
            )

            const result = await new Resolver(contract).resolve(account.identifier)
            console.log(`${JSON.stringify(result)}`)

            expect(result.didDocument?.id).toBe(account.identifier)
            expect(Number(result.didDocumentMetadata.versionId)).toBe(blockHeightBeforeChange + 1)
            expect(result.didDocument?.verificationMethod).toBeDefined()
            let count = result.didDocument?.verificationMethod?.length
            expect(count).toBeDefined()
            if (count === undefined) {
                count = 0
            }

            expect(result.didDocument?.verificationMethod?.at(0)?.blockchainAccountId)
                .toBe(`eip155:2020:${account.address}`)
            expect(result.didDocument?.verificationMethod?.at(count - 1)?.blockchainAccountId)
                .toBe(`eip155:2020:${delegate.address}`)
        })

        it('Revoke delegate signed', async () => {
            const delegate = Blockchain.createBlockAddress()
            console.log(`new delegate=${JSON.stringify(delegate)}`)
            const contract = Blockchain.getDefaultContract(Blockchain.getDefaultSigner(account.privateKey))
            const controller = new Controller(account.identifier, contract)

            const blockHeightBeforeChange = (await Blockchain.getDefaultProvider(ProviderType.ipc).getBlock('latest')).number
            console.log(`Current height=${blockHeightBeforeChange}`)

            await controller.addDelegate(DelegateType.SignAuth, delegate.address, 86402)
            const hash = await controller.createRevokeDelegateHash(DelegateType.SignAuth, delegate.address)

            const signature = new SigningKey(account.privateKey).signDigest(hash)

            await controller.revokeDelegateSigned(
                DelegateType.SignAuth,
                delegate.address,
                {
                    sigV: signature.v,
                    sigR: signature.r,
                    sigS: signature.s
                }
            )

            await sleep(1000)

            const result = await new Resolver(contract).resolve(account.identifier)
            console.log(`${JSON.stringify(result)}`)

            expect(result.didDocument?.id).toBe(account.identifier)
            expect(Number(result.didDocumentMetadata.versionId)).toBeGreaterThanOrEqual(blockHeightBeforeChange + 2)
            expect(result.didDocument?.verificationMethod?.at(0)?.blockchainAccountId)
                .toBe(`eip155:2020:${account.address}`)
            expect(result.didDocument?.verificationMethod?.find(
                s => s?.blockchainAccountId === `eip155:2020:${delegate.address}`)).toBeUndefined()
        })
    })
})