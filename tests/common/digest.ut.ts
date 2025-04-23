import { Digest } from "../../src/common/digest"
import { digest } from "../../src/common/crypto"

describe("Digest", () => {
    it("sha256", async function() {
        const content = new Uint8Array([1,2,3,4,5,6,7,8,9])
        const hash1 = await digest(content, "SHA-256")
        const hash2 = new Digest().update(content).sum()
        expect(hash2).toStrictEqual(hash1)
    })
})
