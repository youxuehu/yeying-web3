import { CipherTypeEnum } from "../yeying/api/common/code"

export function isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.crypto !== "undefined"
}

// 检测环境是否为Node.js
export function isNode(): boolean {
    return (
        typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null
    )
}

export function encodeString(s: string) {
    return new TextEncoder().encode(s)
}

export function decodeString(bytes: Uint8Array | ArrayBuffer): string {
    return new TextDecoder().decode(bytes)
}

export function encodeBase64(bytes: ArrayBuffer | Uint8Array) {
    return Buffer.from(bytes).toString("base64")
}

export function decodeBase64(str: string) {
    return Buffer.from(str, "base64")
}

export function generateIv(len = 12): Uint8Array {
    let subtleCrypto
    if (isBrowser()) {
        subtleCrypto = window.crypto
    } else if (isNode()) {
        subtleCrypto = require("crypto")
    } else {
        throw new Error("Unsupported environment")
    }
    return subtleCrypto.getRandomValues(new Uint8Array(len))
}

export async function computeHash(
    content: Uint8Array | string
): Promise<Uint8Array> {
    let subtleCrypto
    if (isBrowser()) {
        subtleCrypto = window.crypto.subtle
    } else if (isNode()) {
        const crypto = require("crypto")
        subtleCrypto = crypto.subtle
    } else {
        throw new Error("Unsupported environment")
    }

    return new Uint8Array(await subtleCrypto.digest("SHA-256", content))
}

export function fromDidToPublicKey(did: string) {
    if (did === undefined || did === null) {
        return did
    }

    const publicKey = did.slice(did.lastIndexOf(":") + 1)
    return trimLeft(publicKey, "0x")
}

export function trimLeft(str: string, trim: string) {
    if (str === undefined || str === null) {
        return str
    }

    return str.startsWith(trim) ? str.substring(trim.length) : str
}

export function convertCipherTypeTo(type: CipherTypeEnum): string {
    switch (type) {
        case CipherTypeEnum.CIPHER_TYPE_AES_GCM_256:
            return "AES-GCM"
        default:
            return "AES-GCM"
    }
}

export async function deriveRawKeyFromString(
    algorithmName: string,
    password: string
): Promise<CryptoKey> {
    let subtleCrypto
    if (isBrowser()) {
        subtleCrypto = window.crypto.subtle
    } else if (isNode()) {
        const crypto = require("crypto")
        subtleCrypto = crypto.subtle
    } else {
        throw new Error("Unsupported environment")
    }

    const passwordHash = await computeHash(new TextEncoder().encode(password))
    return subtleCrypto.importKey("raw", passwordHash, algorithmName, false, [
        "encrypt",
        "decrypt"
    ])
}

export async function encrypt(
    name: string,
    key: CryptoKey,
    iv: Uint8Array,
    content: Uint8Array | ArrayBuffer
): Promise<ArrayBuffer> {
    let subtleCrypto
    if (isBrowser()) {
        subtleCrypto = window.crypto.subtle
    } else if (isNode()) {
        const crypto = require("crypto")
        subtleCrypto = crypto.subtle
    } else {
        throw new Error("Unsupported environment")
    }
    return await subtleCrypto.encrypt({ name: name, iv: iv }, key, content)
}

export async function decrypt(
    name: string,
    key: CryptoKey,
    iv: Uint8Array,
    content: Uint8Array | ArrayBuffer
): Promise<ArrayBuffer> {
    let subtleCrypto
    if (isBrowser()) {
        subtleCrypto = window.crypto.subtle
    } else if (isNode()) {
        const crypto = require("crypto")
        subtleCrypto = crypto.subtle
    } else {
        throw new Error("Unsupported environment")
    }

    return await subtleCrypto.decrypt({ name: name, iv: iv }, key, content)
}
