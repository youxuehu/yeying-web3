export interface JwtSigner {
    sign(data: string | Uint8Array, privateKey?: Uint8Array): Promise<string>

    verify(data: string, signature: string, publicKeyHex: string): boolean
}