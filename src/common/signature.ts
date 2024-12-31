import elliptic from 'elliptic'
import { trimLeft } from './codec'

export async function signHashBytes(privateKey: string, hashBytes: Uint8Array) {
    const ec = new elliptic.ec('secp256k1')
    const keyPair = ec.keyFromPrivate(trimLeft(privateKey, '0x'), 'hex')
    const signature = keyPair.sign(hashBytes, { canonical: true })
    return signature.toDER('hex')
}

export async function verifyHashBytes(publicKey: string, hashBytes: Uint8Array, signature: string) {
    const ec = new elliptic.ec('secp256k1')
    const pubKeyEc = ec.keyFromPublic(trimLeft(publicKey, '0x'), 'hex')
    return pubKeyEc.verify(hashBytes, signature)
}
