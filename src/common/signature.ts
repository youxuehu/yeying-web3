import elliptic from 'elliptic'
import { trimLeft } from './codec'

/**
 * 使用私钥对哈希值进行签名。
 * 该函数使用椭圆曲线密码学（Elliptic Curve Cryptography, ECC）的 `secp256k1` 曲线，
 * 对给定的哈希值进行签名，并返回签名的 DER 编码（十六进制字符串）。
 * @param privateKey - 用于签名的私钥（十六进制字符串）
 * @param hashBytes - 待签名的哈希值（Uint8Array 格式）
 * @returns 返回签名的 DER 编码（十六进制字符串）
 * @example
 * ```ts
 * const privateKey = '0x...' // 私钥
 * const hashBytes = new Uint8Array( 哈希值 )
 * const signature = await signHashBytes(privateKey, hashBytes)
 * console.log(signature) // 输出：签名的十六进制字符串
 * ```
 */
export async function signHashBytes(privateKey: string, hashBytes: Uint8Array) {
    const ec = new elliptic.ec('secp256k1')
    const keyPair = ec.keyFromPrivate(trimLeft(privateKey, '0x'), 'hex')
    const signature = keyPair.sign(hashBytes, { canonical: true })
    return signature.toDER('hex')
}

/**
 * 使用公钥验证哈希值的签名。
 * 该函数使用椭圆曲线密码学（Elliptic Curve Cryptography, ECC）的 `secp256k1` 曲线，
 * 验证给定的哈希值和签名是否与公钥匹配。
 * @param publicKey - 用于验证的公钥（十六进制字符串）
 * @param hashBytes - 待验证的哈希值（Uint8Array 格式）
 * @param signature - 签名字符串
 * @returns 如果签名有效，返回 true；否则返回 false
 * @example
 * ```ts
 * const publicKey = '0x...' // 公钥
 * const hashBytes = new Uint8Array( 哈希值 )
 * const signature = '...' // 签名
 * const isValid = await verifyHashBytes(publicKey, hashBytes, signature)
 * console.log(isValid) // 输出：true 或 false
 * ```
 */
export async function verifyHashBytes(publicKey: string, hashBytes: Uint8Array, signature: string) {
    const ec = new elliptic.ec('secp256k1')
    const pubKeyEc = ec.keyFromPublic(trimLeft(publicKey, '0x'), 'hex')
    return pubKeyEc.verify(hashBytes, signature)
}
