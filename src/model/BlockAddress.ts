import {NetworkType} from './Constant';

export interface BlockAddress {
    identifier: string
    address: string
    privateKey: string
    publicKey: string
}

export interface IdentityAddress {
    identifier: string
    address: string
    publicKey: string
    networkType: NetworkType
}

export type bytes32 = string
/**
 * Interface for transporting v, r, s signature parameters used in meta transactions
 */
export interface MetaSignature {
    sigV: number
    sigR: bytes32
    sigS: bytes32
}