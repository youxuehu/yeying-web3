import { Digest } from "../../src/common/digest"

describe("Digest", () => {
    it("sha256", async function() {
        const content = new Uint8Array([1,2,3,4,5,6,7,8,9])
        const hash1 = new Uint8Array(await crypto.subtle.digest("SHA-256", content))
        const hash2 = new Digest().update(content).sum()
        expect(hash2).toStrictEqual(hash1)
    })
})
