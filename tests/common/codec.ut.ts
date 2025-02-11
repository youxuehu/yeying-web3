import { decodeBase64, encodeBase64 } from "../../src/common/codec"
import { NetworkTypeEnum } from "../../src"

describe("Codec", () => {
    it("base64", async function() {
        const content = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9])
        let binaryString1 = ""
        for (let i = 0; i < content.byteLength; i++) {
            binaryString1 += String.fromCharCode(content[i])
        }

        const str1 = btoa(binaryString1)
        const str2 = encodeBase64(content)
        expect(str1).toStrictEqual(str2)

        const binaryString2 = atob(str1)
        const content1 = new Uint8Array(binaryString2.length)
        for (let i = 0; i < binaryString2.length; i++) {
            content1[i] = binaryString2.charCodeAt(i)
        }
        const content2 = new Uint8Array(decodeBase64(str2))
        expect(content1).toStrictEqual(content)
        expect(content2).toStrictEqual(content)
    })

    it("enum", () => {
        let type: NetworkTypeEnum
        type = NetworkTypeEnum['TEST' as keyof typeof NetworkTypeEnum]
        expect(type).toBeUndefined()
        type = NetworkTypeEnum['NETWORK_TYPE_YEYING' as keyof typeof NetworkTypeEnum]
        expect(type).toBe(NetworkTypeEnum.NETWORK_TYPE_YEYING)
        const str = NetworkTypeEnum[NetworkTypeEnum.NETWORK_TYPE_YEYING]
        expect(str).toBe('NETWORK_TYPE_YEYING')
    })
})
