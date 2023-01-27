import {CallOverrides, Contract} from '@ethersproject/contracts'
import {TransactionReceipt} from '@ethersproject/providers'
import {parseIdentifier, stringToBytes32} from '../tool/string'
import {arrayify, concat, hexConcat, hexlify, isHexString, zeroPad,} from '@ethersproject/bytes'
import {MESSAGE_PREFIX} from '../model/Constant'
import {formatBytes32String, keccak256, toUtf8Bytes} from 'ethers/lib/utils'
import {IdentityAddress, MetaSignature} from '../model/BlockAddress'
import {Signer} from 'ethers'
import {DelegateType} from '../model/Erc1056Event'

export class Controller {
    contract: Contract
    identityAddress: IdentityAddress
    identifier: string
    signer: Signer

    constructor(identifier: string, contract: Contract, singer?: Signer) {
        this.identityAddress = parseIdentifier(identifier)
        this.contract = contract
        this.identifier = identifier
        this.signer = singer ? singer : contract.signer
    }

    async getOwner(address?: string, block?: number | string): Promise<string> {
        const result = await this.contract.functions.identityOwner(address || this.identityAddress.address, {block})
        return result[0]
    }

    async setOwnerSigned(newOwner: string, metaSignature: MetaSignature, signer?: Signer, options: CallOverrides = {}): Promise<TransactionReceipt> {
        const currentSigner = signer ? signer : this.signer
        const contract = await this.contract.connect(currentSigner)

        if (options.gasLimit === undefined) {
            options.gasLimit = await contract.estimateGas.changeOwnerSigned(this.identityAddress.address, metaSignature.sigV, metaSignature.sigR, metaSignature.sigS, newOwner)
        }

        const ownerChange = await contract.functions.changeOwnerSigned(
            this.identityAddress.address,
            metaSignature.sigV,
            metaSignature.sigR,
            metaSignature.sigS,
            newOwner,
            options)
        return await ownerChange.wait()
    }

    async createSetOwnerHash(newOwner: string) {
        const paddedNonce = await this.getPaddedNonceCompatibility()
        const dataToHash = hexConcat([
            MESSAGE_PREFIX,
            this.contract.address,
            paddedNonce,
            this.identityAddress.address,
            concat([toUtf8Bytes('changeOwner'), newOwner]),
        ])
        return keccak256(dataToHash)
    }

    async setOwner(newOwner: string, signer?: Signer, options: CallOverrides = {}): Promise<TransactionReceipt> {
        const contract = await this.contract.connect(signer ? signer : this.signer)
        if (options.gasLimit === undefined) {
            options.gasLimit = await contract.estimateGas.changeOwner(this.identityAddress.address, newOwner)
        }
        const ownerChange = await contract.functions.changeOwner(this.identityAddress.address, newOwner, options)
        return await ownerChange.wait()
    }

    async setAttribute(attrName: string, attrValue: string, exp: number, signer?: Signer, options: CallOverrides = {}): Promise<TransactionReceipt> {
        const contract = await this.contract.connect(signer ? signer : this.signer)
        const {n, v} = this.convertAttribute(attrName, attrValue)
        if (options.gasLimit === undefined) {
            options.gasLimit = await contract.estimateGas.setAttribute(this.identityAddress.address, n, v, exp)
        }

        const setAttrTx = await contract.functions.setAttribute(this.identityAddress.address, n, v, exp, options)
        return await setAttrTx.wait()
    }

    async revokeAttribute(attrName: string, attrValue: string, signer?: Signer, options: CallOverrides = {}): Promise<TransactionReceipt> {
        const contract = await this.contract.connect(signer ? signer : this.signer)
        const {n, v} = this.convertAttribute(attrName, attrValue)
        if (options.gasLimit === undefined) {
            options.gasLimit = await contract.estimateGas.revokeAttribute(this.identityAddress.address, n, v)
        }

        const revokeTX = await contract.functions.revokeAttribute(this.identityAddress.address, n, v, options)
        return await revokeTX.wait()
    }

    async createSetAttributeHash(attrName: string, attrValue: string, exp: number) {
        const paddedNonce = await this.getPaddedNonceCompatibility()

        // The incoming attribute value may be a hex encoded key, or an utf8 encoded string (like service endpoints)
        const encodedValue = isHexString(attrValue) ? attrValue : toUtf8Bytes(attrValue)

        const dataToHash = hexConcat([
            MESSAGE_PREFIX,
            this.contract.address,
            paddedNonce,
            this.identityAddress.address,
            concat([toUtf8Bytes('setAttribute'), formatBytes32String(attrName), encodedValue, zeroPad(hexlify(exp), 32)]),
        ])
        return keccak256(dataToHash)
    }

    async setAttributeSigned(attrName: string, attrValue: string, exp: number, metaSignature: MetaSignature,
                             signer?: Signer,
                             options: CallOverrides = {},): Promise<TransactionReceipt> {
        const contract = await this.contract.connect(signer ? signer : this.signer)
        const {n, v} = this.convertAttribute(attrName, attrValue)
        if (options.gasLimit === undefined) {
            options.gasLimit = await contract.estimateGas.setAttributeSigned(this.identityAddress.address, metaSignature.sigV, metaSignature.sigR, metaSignature.sigS, n, v, exp)
        }

        const setAttrTx = await contract.functions.setAttributeSigned(
            this.identityAddress.address,
            metaSignature.sigV,
            metaSignature.sigR,
            metaSignature.sigS,
            n, v,
            exp,
            options)
        return await setAttrTx.wait()
    }

    async createRevokeAttributeHash(attrName: string, attrValue: string) {
        const paddedNonce = await this.getPaddedNonceCompatibility()

        const dataToHash = hexConcat([
            MESSAGE_PREFIX,
            this.contract.address,
            paddedNonce,
            this.identityAddress.address,
            concat([toUtf8Bytes('revokeAttribute'), formatBytes32String(attrName), toUtf8Bytes(attrValue)]),
        ])
        return keccak256(dataToHash)
    }

    async revokeAttributeSigned(attrName: string, attrValue: string, metaSignature: MetaSignature,
                                signer?: Signer,
                                options: CallOverrides = {}): Promise<TransactionReceipt> {
        const contract = await this.contract.connect(signer ? signer : this.signer)
        const {n, v} = this.convertAttribute(attrName, attrValue)
        if (options.gasLimit === undefined) {
            options.gasLimit = await contract.estimateGas.revokeAttributeSigned(this.identityAddress.address, metaSignature.sigV, metaSignature.sigR, metaSignature.sigS, n, v)
        }

        const revokeAttributeTX = await contract.functions.revokeAttributeSigned(
            this.identityAddress.address,
            metaSignature.sigV,
            metaSignature.sigR,
            metaSignature.sigS,
            n, v,
            options)
        return await revokeAttributeTX.wait()
    }

    private convertAttribute(name: string, value: string): { n: string, v: string } {
        return {
            n: name.startsWith('0x') ? name : stringToBytes32(name),
            v: value.startsWith('0x') ? value : '0x' + Buffer.from(value, 'utf-8').toString('hex')
        }
    }

    private async getPaddedNonceCompatibility() {
        const nonceKey = await this.getOwner(this.identityAddress.address)
        return zeroPad(arrayify(await this.contract.nonce(nonceKey)), 32)
    }

    async addDelegate(delegateType: DelegateType, delegateAddress: string, exp: number,
                      signer?: Signer,
                      options: CallOverrides = {}): Promise<TransactionReceipt> {
        const delegateTypeBytes = stringToBytes32(delegateType)
        const contract = await this.contract.connect(signer ? signer : this.signer)

        if (options.gasLimit === undefined) {
            options.gasLimit = await contract.estimateGas.addDelegate(this.identityAddress.address, delegateTypeBytes, delegateAddress, exp)
        }

        const addDelegateTx = await contract.functions.addDelegate(
            this.identityAddress.address,
            delegateTypeBytes,
            delegateAddress,
            exp,
            options)
        return await addDelegateTx.wait()
    }

    async createAddDelegateHash(delegateType: DelegateType, delegateAddress: string, exp: number) {
        const paddedNonce = await this.getPaddedNonceCompatibility()
        const dataToHash = hexConcat([
            MESSAGE_PREFIX,
            this.contract.address,
            paddedNonce,
            this.identityAddress.address,
            concat([
                toUtf8Bytes('addDelegate'),
                formatBytes32String(delegateType),
                delegateAddress,
                zeroPad(hexlify(exp), 32),
            ]),])
        return keccak256(dataToHash)
    }

    async addDelegateSigned(delegateType: DelegateType, delegateAddress: string, exp: number, metaSignature: MetaSignature,
                            signer?: Signer,
                            options: CallOverrides = {}): Promise<TransactionReceipt> {
        const delegateTypeBytes = stringToBytes32(delegateType)
        const contract = await this.contract.connect(signer ? signer : this.signer)

        if (options.gasLimit === undefined) {
            options.gasLimit = await contract.estimateGas.addDelegateSigned(this.identityAddress.address, metaSignature.sigV, metaSignature.sigR, metaSignature.sigS, delegateTypeBytes, delegateAddress, exp)
        }

        const addDelegateTx = await contract.functions.addDelegateSigned(
            this.identityAddress.address,
            metaSignature.sigV,
            metaSignature.sigR,
            metaSignature.sigS,
            delegateTypeBytes,
            delegateAddress,
            exp,
            options)
        return await addDelegateTx.wait()
    }

    async revokeDelegate(delegateType: DelegateType, delegateAddress: string, signer?: Signer, options: CallOverrides = {}): Promise<TransactionReceipt> {
        const delegateTypeBytes = stringToBytes32(delegateType)
        const contract = await this.contract.connect(signer ? signer : this.signer)

        if (options.gasLimit === undefined) {
            options.gasLimit = await contract.estimateGas.revokeDelegate(this.identityAddress.address, delegateTypeBytes, delegateAddress)
        }

        const addDelegateTx = await contract.functions.revokeDelegate(
            this.identityAddress.address,
            delegateTypeBytes,
            delegateAddress,
            options)
        return await addDelegateTx.wait()
    }

    async createRevokeDelegateHash(delegateType: DelegateType, delegateAddress: string) {
        const paddedNonce = await this.getPaddedNonceCompatibility()
        const dataToHash = hexConcat([
            MESSAGE_PREFIX,
            this.contract.address,
            paddedNonce,
            this.identityAddress.address,
            concat([toUtf8Bytes('revokeDelegate'), formatBytes32String(delegateType), delegateAddress]),
        ])
        return keccak256(dataToHash)
    }

    async revokeDelegateSigned(delegateType: DelegateType, delegateAddress: string, metaSignature: MetaSignature,
                               signer?: Signer,
                               options: CallOverrides = {}): Promise<TransactionReceipt> {
        const delegateTypeBytes = stringToBytes32(delegateType)
        const contract = await this.contract.connect(signer ? signer : this.signer)
        if (options.gasLimit === undefined) {
            options.gasLimit = await contract.estimateGas.revokeDelegateSigned(this.identityAddress.address, metaSignature.sigV, metaSignature.sigR, metaSignature.sigS, delegateTypeBytes, delegateAddress)
        }

        const addDelegateTx = await contract.functions.revokeDelegateSigned(
            this.identityAddress.address,
            metaSignature.sigV,
            metaSignature.sigR,
            metaSignature.sigS,
            delegateTypeBytes,
            delegateAddress,
            options)
        return await addDelegateTx.wait()
    }
}