import { encodeString } from './codec'

type AlgorithmIdentifier = string | { name: string }
type BufferSource = ArrayBuffer | DataView
type KeyUsages = Array<'encrypt' | 'decrypt' | 'sign' | 'verify' | 'deriveKey' | 'deriveBits' | 'wrapKey' | 'unwrapKey'>

export function convertToAlgorithmName(name: string): string {
    switch (name) {
        case 'CIPHER_TYPE_AES_GCM_256':
            return 'AES-GCM'
        default:
            return name
    }
}

// 获取跨平台的 Web Crypto API
function getCrypto(): Crypto {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
        return window.crypto
    }
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
        return globalThis.crypto
    }
    try {
        const { webcrypto } = require('crypto')
        return webcrypto
    } catch (e) {
        throw new Error('Web Crypto API not available')
    }
}

const crypto = getCrypto()

export async function digest(
    data: string | BufferSource,
    algorithm: AlgorithmIdentifier = 'SHA-256'
): Promise<Uint8Array> {
    const buffer = typeof data === 'string' ? encodeString(data) : data
    const hashBuffer = await crypto.subtle.digest(algorithm, buffer)
    return new Uint8Array(hashBuffer)
}

export async function importKey(key: Uint8Array, algorithm: AlgorithmIdentifier = 'AES-GCM'): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'raw',
        key,
        { name: typeof algorithm === 'string' ? algorithm : algorithm.name },
        true,
        ['encrypt', 'decrypt'] as KeyUsages
    )
}

export async function exportKey(key: CryptoKey): Promise<Uint8Array> {
    const exported = await crypto.subtle.exportKey('raw', key)
    return new Uint8Array(exported)
}

export function generateIv(len = 12): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(len))
}

export async function generateKey(
    algorithm: AlgorithmIdentifier = 'AES-GCM',
    length: number = 256
): Promise<CryptoKey> {
    const param = {
        name: typeof algorithm === 'string' ? algorithm : algorithm.name,
        length
    } as AesKeyGenParams
    return crypto.subtle.generateKey(param, true, ['encrypt', 'decrypt'] as KeyUsages)
}

export async function encrypt(
    key: CryptoKey,
    data: string | BufferSource,
    iv: Uint8Array,
    algorithm: AlgorithmIdentifier = 'AES-GCM'
): Promise<ArrayBuffer> {
    const encodedData = typeof data === 'string' ? encodeString(data) : data
    const param = {
        name: typeof algorithm === 'string' ? algorithm : algorithm.name,
        iv
    } as AesGcmParams
    return await crypto.subtle.encrypt(param, key, encodedData)
}

export async function decrypt(
    key: CryptoKey,
    data: BufferSource,
    iv: Uint8Array,
    algorithm: AlgorithmIdentifier = 'AES-GCM'
): Promise<ArrayBuffer> {
    const param = {
        name: typeof algorithm === 'string' ? algorithm : algorithm.name,
        iv
    } as AesGcmParams
    return await crypto.subtle.decrypt(param, key, data)
}
