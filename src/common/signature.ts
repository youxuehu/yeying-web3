import elliptic from 'elliptic'
import { trimLeft } from './codec'

/**
 * 使用私钥对数据的哈希值进行签名。
 *
 * 该函数使用 ECDSA（椭圆曲线数字签名算法）生成数据的签名。通过 `secp256k1` 曲线，基于提供的私钥对 `hashBytes` 进行签名，并返回签名的 DER 格式（十六进制）。
 *
 * @param privateKey - 用于生成签名的私钥。应提供去除 `0x` 前缀的十六进制字符串。
 * @param hashBytes - 需要签名的数据的哈希值，类型为 `Uint8Array`。
 *
 * @returns 返回签名的 DER 格式十六进制字符串。
 *
 * @example
 * const signature = await signHashBytes(privateKey, hashBytes);
 * console.log(signature);  // 输出：签名的十六进制字符串
 */
export async function signHashBytes(privateKey: string, hashBytes: Uint8Array) {
    const ec = new elliptic.ec('secp256k1')
    const keyPair = ec.keyFromPrivate(trimLeft(privateKey, '0x'), 'hex')
    const signature = keyPair.sign(hashBytes, { canonical: true })
    return signature.toDER('hex')
}

/**
 * 使用公钥验证数据签名。
 *
 * 该函数使用 ECDSA（椭圆曲线数字签名算法）验证给定数据的签名是否有效。公钥使用 `secp256k1` 曲线进行验证。
 *
 * @param publicKey - 用于验证签名的公钥。应提供去除 `0x` 前缀的十六进制字符串。
 * @param hashBytes - 需要验证签名的数据的哈希值，类型为 `Uint8Array`。
 * @param signature - 与 `hashBytes` 对应的签名。
 *
 * @returns 如果签名有效，返回 `true`；否则返回 `false`。
 *
 * @example
 * const isValid = await verifyHashBytes(publicKey, hashBytes, signature);
 * console.log(isValid);  // 输出：true 或 false
 */
export async function verifyHashBytes(publicKey: string, hashBytes: Uint8Array, signature: string) {
    const ec = new elliptic.ec('secp256k1')
    const pubKeyEc = ec.keyFromPublic(trimLeft(publicKey, '0x'), 'hex')
    return pubKeyEc.verify(hashBytes, signature)
}
