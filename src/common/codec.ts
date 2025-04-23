export function encodeString(s: string) {
    return new TextEncoder().encode(s)
}

export function decodeString(bytes: Uint8Array | ArrayBuffer): string {
    return new TextDecoder().decode(bytes)
}

export function encodeBase64(bytes: Uint8Array | ArrayBuffer) {
    return Buffer.from(bytes).toString('base64')
}

export function decodeBase64(str: string) {
    return Buffer.from(str, 'base64')
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
