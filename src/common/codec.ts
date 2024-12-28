export function encodeString(s: string) {
    return new TextEncoder().encode(s)
}

export function decodeString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes)
}

export function encodeBase64(bytes: Uint8Array) {
    return Buffer.from(bytes).toString("base64")
}

export function decodeBase64(str: string) {
    return Buffer.from(str, "base64")
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
