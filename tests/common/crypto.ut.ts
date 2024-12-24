import {
    convertCipherTypeTo,
    decodeString,
    decrypt,
    deriveRawKeyFromString,
    encodeBase64,
    encodeString,
    encrypt,
    generateIv
} from "../../src/common/crypto"
import { CipherTypeEnum } from "../../src"

describe("Crypto", () => {
    it("encrypt and decrypt", async function() {
        const cipherType = CipherTypeEnum.CIPHER_TYPE_AES_GCM_256
        const token = generateIv(32)
        const plainText = "hello world"
        const algorithmName = convertCipherTypeTo(cipherType)
        const cryptoKey = await deriveRawKeyFromString(algorithmName, encodeBase64(token))
        const iv = generateIv(12)
        const cipherText = await encrypt(algorithmName, cryptoKey, iv, encodeString(plainText))
        const result = await decrypt(algorithmName, cryptoKey, iv, cipherText)
        expect(decodeString(result)).toEqual(plainText)
    })
})