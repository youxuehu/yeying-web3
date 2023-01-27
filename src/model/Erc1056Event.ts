import {BigNumber} from 'ethers'
import {VerificationMethod} from 'did-resolver'
import {JsonWebKey} from 'did-resolver/src/resolver'

export interface Erc1056Event {
    identity: string
    previousChange: BigNumber
    validTo?: BigNumber
    eventName: string
    blockNumber: number
}

export interface DIDOwnerChanged extends Erc1056Event {
    owner: string
}

export interface DIDAttributeChanged extends Erc1056Event {
    name: string
    value: string
    validTo: BigNumber
}

export interface DIDDelegateChanged extends Erc1056Event {
    delegateType: string
    delegate: string
    validTo: BigNumber
}

export enum DidEventName { DidOwnerChanged, DidAttributeChanged, DidDelegateChanged, }

export function isEvent(name: string, events: DidEventName[]): boolean {
    return events.find(e => DidEventName[e].toLowerCase() === name.toLowerCase()) !== undefined
}

export enum DelegateType { SignAuth = 'signAuth', VerifyKey = 'verifyKey', Enc = 'enc', }

export const legacyAttrTypes: Record<string, string> = {
    signAuth: 'SignatureAuthentication2018',
    verifyKey: 'VerificationKey2018',
    enc: 'KeyAgreementKey2019',
}

export enum VerificationMethodType {
    EcdsaSecp256k1VerificationKey2019 = 'EcdsaSecp256k1VerificationKey2019',
    EcdsaSecp256k1RecoveryMethod2020 = 'EcdsaSecp256k1RecoveryMethod2020',
    Ed25519VerificationKey2018 = 'Ed25519VerificationKey2018',
    RSAVerificationKey2018 = 'RSAVerificationKey2018',
    X25519KeyAgreementKey2019 = 'X25519KeyAgreementKey2019',
}

export const legacyAlgoMap: Record<string, string> = {
    Secp256k1VerificationKey2018: VerificationMethodType.EcdsaSecp256k1VerificationKey2019,
    Secp256k1SignatureAuthentication2018: VerificationMethodType.EcdsaSecp256k1VerificationKey2019,
    Ed25519SignatureAuthentication2018: VerificationMethodType.Ed25519VerificationKey2018,
    RSAVerificationKey2018: VerificationMethodType.RSAVerificationKey2018,
    Ed25519VerificationKey2018: VerificationMethodType.Ed25519VerificationKey2018,
    X25519KeyAgreementKey2019: VerificationMethodType.X25519KeyAgreementKey2019,
}

export interface LegacyVerificationMethod extends VerificationMethod {
    [x: string]: string | undefined | JsonWebKey
}