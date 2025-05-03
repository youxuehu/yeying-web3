import { decrypt, digest, encrypt, exportKey, generateIv, generateKey, importKey } from "../../src/common/crypto"
import { decodeString, encodeString } from "../../src/common/codec"
import { InvalidPassword } from "../../src"

describe("Crypto", () => {
    it("encrypt and decrypt", async function() {
        // 1. 生成密钥
        const key = await generateKey()
        console.log("Key generated")

        // 2. 导出密钥 (可用于存储或传输)
        const exportedKey = await exportKey(key)

        // 3. 加密数据
        const iv = generateIv()
        const algorithm = "AES-GCM"
        const originalText = "Sensitive data to encrypt"
        const cipher = await encrypt(key, originalText, iv, algorithm)

        // 4. 解密数据
        const importedKey = await importKey(exportedKey)
        const plain = await decrypt(importedKey, cipher, iv, algorithm)
        expect(decodeString(new Uint8Array(plain))).toStrictEqual(originalText)
    })

    it('aes-gcm', async () => {
        const token = generateIv(32)
        const plainText = "hello world"
        const algorithmName = "AES-GCM"

        const cryptoKey = await importKey(await digest(token), algorithmName)
        const iv = generateIv(12)
        const cipherText = await encrypt(cryptoKey, encodeString(plainText), iv, algorithmName)
        const result = await decrypt(cryptoKey, cipherText, iv, algorithmName)
        expect(decodeString(result)).toEqual(plainText)
    })

    it('invalid password', async () => {
        const plainText = "hello world"
        const algorithmName = "AES-GCM"

        const password1 = "password1"
        const cryptoKey1 = await importKey(await digest(password1), algorithmName)
        const iv = generateIv(12)
        const cipherText = await encrypt(cryptoKey1, encodeString(plainText), iv, algorithmName)

        const password2 = "password2"
        const cryptoKey2 = await importKey(await digest(password2), algorithmName)
        await expect(decrypt(cryptoKey2, cipherText, iv, algorithmName)).rejects.toThrow(InvalidPassword)
    })
})