import { IdentityServiceExtend } from "../../src"

describe("Protoc", () => {
    it("create", async function() {
        const serviceJson = {
            "code": "SERVICE_CODE_AGENT",
            "proxy": "http://localhost:8541",
            "grpc": "localhost:9201",
            "apis": "API_CODE_USER,API_CODE_LLM"
        }

        const extend1 = IdentityServiceExtend.create(serviceJson)
        // 不能直接强制转化json成protoc对象，导致序列化不一致
        const extend2 = JSON.parse(JSON.stringify(serviceJson)) as IdentityServiceExtend
        const extend3 = IdentityServiceExtend.create(extend1)

        const bytes1 = IdentityServiceExtend.encode(extend1).finish()
        const bytes2 = IdentityServiceExtend.encode(extend2).finish()
        const bytes3 = IdentityServiceExtend.encode(extend3).finish()
        expect(bytes2.length).toStrictEqual(bytes1.length + 2)
        expect(bytes3).toStrictEqual(bytes1)
    })
})
