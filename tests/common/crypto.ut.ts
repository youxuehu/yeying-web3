import { decrypt, encrypt, exportKey, generateIv, generateKey, importKey } from "../../src/common/crypto"
import { decodeString } from "../../src/common/codec"

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
})