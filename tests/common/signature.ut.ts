import { signHashBytes, verifyHashBytes } from "../../src"
import { encodeString } from "../../src/common/codec"

describe("Signature", () => {
    it("sign and verify", async function() {
        const privateKey = "0x01422bbc1c2854ac02e06ece1b7e38049249037ba557586b529e01372b17946c"
        const publicKey = "0x03259260c1aa08559ccd2dbaeaf6400a4a5c87432ae043400c5560a7d99302e027"
        const content = "hello world!"
        const hashBytes = new Uint8Array(await crypto.subtle.digest("SHA-256", encodeString(content)))
        const signature = await signHashBytes(privateKey, hashBytes)
        console.log(`length=${signature.length}, signature=${signature}`)
        const passed = verifyHashBytes(publicKey, hashBytes, signature)
        expect(passed).toEqual(passed)
    })
})

