import {JwtSigner} from '../JwtSigner'
import elliptic, {ec} from 'elliptic'
import {sha256} from '../../tool/degist'
import {base64ToBytes, hexToBytes, leftPad, bytesToHex} from '../../tool/string'
import * as u8a from 'uint8arrays'


export class Es256kSigner implements JwtSigner {
    recoverable: boolean
    privateKey?: Uint8Array

    constructor(recoverable: boolean, privateKey?: Uint8Array | string) {
        this.recoverable = recoverable
        this.privateKey = typeof privateKey === 'string' ? hexToBytes(privateKey) : privateKey
    }

    async sign(data: string | Uint8Array, privateKey?: Uint8Array): Promise<string> {
        privateKey = privateKey ? privateKey : this.privateKey
        if (typeof privateKey === 'undefined') {
            throw new Error('no private key')
        }

        if (privateKey.length !== 32) {
            throw new Error(`bad_key: Invalid private key format. Expecting 32 bytes, but got ${privateKey.length}`)
        }

        const secp256k1 = new elliptic.ec('secp256k1')
        const keyPair: elliptic.ec.KeyPair = secp256k1.keyFromPrivate(privateKey)
        const {r, s, recoveryParam}: elliptic.ec.Signature = keyPair.sign(sha256(data))

        const digest = new Uint8Array(this.recoverable ? 65 : 64)
        digest.set(u8a.fromString(leftPad(r.toString('hex')), 'base16'), 0)
        digest.set(u8a.fromString(leftPad(s.toString('hex')), 'base16'), 32)

        if (this.recoverable) {
            if (typeof recoveryParam === 'undefined') {
                throw new Error('undefined recovery parameter!')
            }

            digest[64] = <number>recoveryParam
        }

        return u8a.toString(digest, 'base64url')
    }

    verify(data: string, signature: string, publicKeyHex: string): boolean {
        const hash: Uint8Array = sha256(data)

        const rawSignature: Uint8Array = base64ToBytes(signature)
        if (rawSignature.length !== (this.recoverable ? 65 : 64)) {
            throw new Error(`wrong signature(${this.recoverable}) length`)
        }

        const r: string = bytesToHex(rawSignature.slice(0, 32))
        const s: string = bytesToHex(rawSignature.slice(32, 64))
        const publicKeyBytes = hexToBytes(publicKeyHex)
        const recoveryParam = this.recoverable ? rawSignature[64] : undefined
        const signatureOptions: ec.SignatureOptions = {r, s, recoveryParam}
        const secp256k1 = new elliptic.ec('secp256k1')
        return secp256k1.keyFromPublic(publicKeyBytes).verify(hash, signatureOptions)
    }
}