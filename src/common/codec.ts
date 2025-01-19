export function encodeString(s: string) {
    return new TextEncoder().encode(s)
}

export function decodeString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes)
}

export function encodeBase64(bytes: Uint8Array) {
    return Buffer.from(bytes).toString('base64')
}

export function decodeBase64(str: string) {
    return Buffer.from(str, 'base64')
}

/**
 * 从 DID (Decentralized Identifier) 提取公钥。
 * 
 * 该函数从给定的 DID 字符串中提取公钥部分。假设 DID 的格式包含冒号 `:`，并且公钥位于冒号后。
 * 如果 DID 为 `null` 或 `undefined`，则直接返回原始 DID。
 * 
 * @param did - 需要提取公钥的 DID 字符串。
 * 
 * @returns 返回提取的公钥（去除前缀 `0x`），如果 DID 为 `null` 或 `undefined`，则返回原始 DID。
 * 
 * @example
 * const did = "did:example:abcdef12345";
 * const publicKey = fromDidToPublicKey(did);
 * console.log(publicKey);  // 输出：abcdef12345
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
