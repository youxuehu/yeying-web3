import elliptic from "elliptic"
import BN from "bn.js"
import crypto, {CipherGCMTypes} from "crypto";
import {CipherTypeEnum} from "../yeying/api/common/code";

export function generateIv(len = 12) {
    return crypto.getRandomValues(new Uint8Array(12))
}

export function computeHash(content: Uint8Array | string) {
    const hash = crypto.createHash("sha256")
    hash.update(content)
    return hash.digest()
}

export function fromDidToPublicKey(did: string) {
    if (did === undefined || did === null) {
        return did
    }

    const publicKey = did.slice(did.lastIndexOf(":") + 1)
    return trimLeft(publicKey, "0x")
}

export function encodeBase64(bytes: ArrayBufferLike) {
    return Buffer.from(bytes).toString("base64")
}

export function trimLeft(str: string, trim: string) {
    if (str === undefined || str === null) {
        return str
    }

    return str.startsWith(trim) ? str.substring(trim.length) : str
}

export function convertCipherTypeTo(type: CipherTypeEnum): CipherGCMTypes {
    switch (type) {
        case CipherTypeEnum.CIPHER_TYPE_AES_GCM_256:
            return "aes-256-gcm"
        default:
            return "aes-256-gcm"
    }
}

export function encrypt(type: CipherTypeEnum, key: Uint8Array, iv: Uint8Array, content: Uint8Array) {
    const cipher = crypto.createCipheriv(convertCipherTypeTo(type), key, iv);
    return Buffer.concat([cipher.update(content), cipher.final(), cipher.getAuthTag()]).toString('base64')
}

export function decrypt(type: CipherTypeEnum, key: Uint8Array, iv: Uint8Array, content: string) {
    const data = Buffer.from(content, "base64")
    const decipher = crypto.createDecipheriv(convertCipherTypeTo(type), key, iv);
    decipher.setAuthTag(data.subarray(data.length - 16))
    return Buffer.concat([decipher.update(data.subarray(0, data.length - 16)), decipher.final()])
}

export function verify(publicKey: string, data: Uint8Array, signature: string) {
    const ec = new elliptic.ec("secp256k1")
    const pubKeyEc = ec.keyFromPublic(trimLeft(publicKey, "0x"), "hex")
    const hashBytes = computeHash(data)
    const buffer = Buffer.from(signature, "hex")
    return pubKeyEc.verify(hashBytes, {
        r: new BN(buffer.subarray(0, 32), "be"),
        s: new BN(buffer.subarray(32, 64), "be"),
        recoveryParam: buffer[64]
    })
}

export function sign(privateKey: string, data: Uint8Array) {
    const ec = new elliptic.ec("secp256k1")
    const keyPair = ec.keyFromPrivate(trimLeft(privateKey, "0x"), "hex")
    const hashBytes = computeHash(data)
    const signature = keyPair.sign(hashBytes, {canonical: true})
    const r = signature.r.toArrayLike(Buffer, "be", 32)
    const s = signature.s.toArrayLike(Buffer, "be", 32)
    // @ts-ignore
    const v = Buffer.from([signature.recoveryParam])
    return Buffer.concat([r, s, v]).toString("hex")
}
