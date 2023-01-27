import {kvToHex} from '../tool/string'
import {Controller} from '../contract/Controller'
import {CallOverrides, Contract} from '@ethersproject/contracts'
import {BlockAddress, MetaSignature} from '../model/BlockAddress'
import {Configuration} from './Configuration'
import {Signer} from 'ethers'
import {DelegateType} from '../model/Erc1056Event'
import {Blockchain} from '../contract/Blockchain'
import {JwtSigner} from './JwtSigner'
import {createJWT, JWTVerified, verifyJWT} from 'did-jwt'
import {Resolver} from '../resolver/Resolver'

export class Identity {
    identifier: string
    controller: Controller
    signer: Signer
    jwtSigner?: JwtSigner
    contract: Contract

    constructor(configuration: Configuration) {
        this.identifier = configuration.identifier
        this.signer = configuration.signer
        this.controller = new Controller(configuration.identifier, configuration.contract)
        this.contract = configuration.contract
    }

    async getOwner(): Promise<string> {
        return await this.controller.getOwner()
    }

    async changeOwner(newOwner: string, txOptions?: CallOverrides): Promise<string> {
        const receipt = await this.controller.setOwner(newOwner, this.signer, txOptions)
        return receipt.transactionHash
    }

    async createSetOwnerHash(newOwner: string): Promise<string> {
        return this.controller.createSetOwnerHash(newOwner)
    }

    async changeOwnerSigned(newOwner: string, signature: MetaSignature,
                            txOptions: CallOverrides = {}): Promise<string> {
        const receipt = await this.controller.setOwnerSigned(newOwner, signature, this.signer, txOptions)
        return receipt.transactionHash
    }

    async addDelegate(delegateType: DelegateType, delegateAddress: string, expiresIn = 86400,
                      txOptions: CallOverrides = {}): Promise<string> {
        const receipt = await this.controller.addDelegate(delegateType, delegateAddress, expiresIn, this.signer,
            {...txOptions})
        return receipt.transactionHash
    }

    async createAddDelegateHash(delegateType: DelegateType, delegateAddress: string,
                                expiresIn = 86400): Promise<string> {
        return this.controller.createAddDelegateHash(delegateType, delegateAddress, expiresIn)
    }

    async addDelegateSigned(delegateType: DelegateType, delegateAddress: string, signature: MetaSignature,
                            expiresIn = 86400, txOptions: CallOverrides = {}): Promise<string> {
        const receipt = await this.controller.addDelegateSigned(
            delegateType,
            delegateAddress,
            expiresIn,
            signature,
            this.signer,
            txOptions)
        return receipt.transactionHash
    }

    async revokeDelegate(delegateType: DelegateType, delegateAddress: string,
                         txOptions: CallOverrides = {}): Promise<string> {
        const receipt = await this.controller.revokeDelegate(delegateType, delegateAddress, this.signer, {...txOptions})
        return receipt.transactionHash
    }

    async createRevokeDelegateHash(delegateType: DelegateType, delegateAddress: string): Promise<string> {
        return this.controller.createRevokeDelegateHash(delegateType, delegateAddress)
    }

    async revokeDelegateSigned(delegateType: DelegateType, delegateAddress: string, signature: MetaSignature,
                               txOptions: CallOverrides = {}): Promise<string> {
        const receipt = await this.controller.revokeDelegateSigned(delegateType, delegateAddress, signature,
            this.signer, txOptions)
        return receipt.transactionHash
    }

    async setAttribute(key: string, value: string, expiresIn = 86400, txOptions: CallOverrides = {}): Promise<string> {
        const receipt = await this.controller.setAttribute(key, kvToHex(key, value), expiresIn, this.signer, txOptions)
        return receipt.transactionHash
    }

    async createSetAttributeHash(attrName: string, attrValue: string, expiresIn: number) {
        return this.controller.createSetAttributeHash(attrName, attrValue, expiresIn)
    }

    async setAttributeSigned(key: string, value: string, expiresIn = 86400, signature: MetaSignature,
                             txOptions: CallOverrides = {}): Promise<string> {
        const receipt = await this.controller.setAttributeSigned(key, kvToHex(key, value), expiresIn, signature,
            this.signer, txOptions)
        return receipt.transactionHash
    }

    async revokeAttribute(key: string, value: string, txOptions: CallOverrides = {}): Promise<string> {
        const receipt = await this.controller.revokeAttribute(key, kvToHex(key, value), this.signer, txOptions)
        return receipt.transactionHash
    }

    async createRevokeAttributeHash(attrName: string, attrValue: string) {
        return this.controller.createRevokeAttributeHash(attrName, attrValue)
    }

    async revokeAttributeSigned(key: string, value: string, signature: MetaSignature,
                                txOptions: CallOverrides = {}): Promise<string> {
        const receipt = await this.controller.revokeAttributeSigned(key, kvToHex(key, value), signature, this.signer,
            txOptions)
        return receipt.transactionHash
    }

    // Create a temporary signing delegate able to sign JWT on behalf of identity
    async createSigningDelegate(delegateType: DelegateType,
                                expiresIn = 86400): Promise<{ ba: BlockAddress; txHash: string }> {
        const ba = Blockchain.createBlockAddress()
        const txHash = await this.addDelegate(delegateType, ba.address, expiresIn)
        return {ba, txHash}
    }

    // eslint-disable-next-line
    async signJWT(jwtSigner: JwtSigner, payload: any, expiresIn = 86400): Promise<string> {
        if (jwtSigner === undefined) {
            throw new Error('No jwt signer configured')
        }

        const func = async (data: string | Uint8Array) => {
            return jwtSigner.sign(data)
        }

        const options = {signer: func, alg: 'ES256K-R', issuer: this.identifier, expiresIn: expiresIn}
        return createJWT(payload, options)
    }

    async verifyJWT(jwt: string): Promise<JWTVerified> {
        return verifyJWT(jwt, {resolver: new Resolver(this.contract), audience: this.identifier})
    }
}