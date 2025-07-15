function getBuffer(): typeof Buffer {
    if (typeof window !== 'undefined' && window.Buffer) {
        return window.Buffer
    }
    if (typeof globalThis !== 'undefined' && globalThis.Buffer) {
        return globalThis.Buffer
    }
    try {
        // 浏览器环境中可能未定义 Buffer，此时应动态引入 polyfill
        const { Buffer } = require('buffer')
        return Buffer
    } catch (e) {
        throw new Error('Buffer is not available in the current environment')
    }
}

const buffer = getBuffer()

export function encodeString(s: string) {
    return new TextEncoder().encode(s)
}

export function decodeString(bytes: Uint8Array | ArrayBuffer): string {
    return new TextDecoder().decode(bytes)
}

export function encodeBase64(bytes: Uint8Array | ArrayBuffer) {
    return buffer.from(bytes).toString('base64')
}

export function decodeBase64(str: string) {
    return buffer.from(str, 'base64')
}

export function encodeHex(bytes: ArrayBuffer | Uint8Array) {
    return buffer.from(bytes).toString('hex')
}

export function decodeHex(str: string) {
    return buffer.from(str, 'hex')
}

/**
 * 从 DID 中提取公钥。
 * 该函数从 DID 字符串中提取公钥部分，并移除前缀（如 `0x`）。
 * 如果输入的 DID 为 `undefined` 或 `null`，直接返回原值。
 * @param did - DID 字符串
 * @returns 返回提取后的公钥字符串
 * @example
 * ```ts
 * const did = 'did:yeying:0x123456789abcdef'
 * const publicKey = fromDidToPublicKey(did)
 * console.log(publicKey) // 输出：123456789abcdef
 * ```
 */
export function fromDidToPublicKey(did: string) {
    if (did === undefined || did === null) {
        return did
    }

    const publicKey = did.slice(did.lastIndexOf(':') + 1)
    return trimLeft(publicKey, '0x')
}

export function trimLeft(str: string, trim: string) {
    if (str === undefined || str === null) {
        return str
    }

    return str.startsWith(trim) ? str.substring(trim.length) : str
}
