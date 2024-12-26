import {
    createBlockAddress,
    createIdentity,
    recoveryFromMnemonic,
    updateIdentity,
    verifyIdentity
} from "../../src/wallet/identity"
import { decodeBase64, encodeBase64 } from "../../src/common/codec"
import {
    BlockAddress,
    IdentityApplicationExtend,
    IdentityCodeEnum,
    IdentityPersonalExtend,
    Mnemonic,
    NetworkTypeEnum,
    SecurityAlgorithm,
    SecurityConfig
} from "../../src/yeying/api/web3/web3_pb"
import { Digest } from "../../src/common/digest"
import { IdentityTemplate } from "../../src/wallet/model"

const iv = crypto.getRandomValues(new Uint8Array(12))
const password: string = "123456"
const algorithm = { name: "AES-GCM", iv: iv }

export async function encryptBlockAddress(
    blockAddress: BlockAddress
) {
    const passwordHash = new Digest().update(new TextEncoder().encode(password)).sum()
    const key = await crypto.subtle.importKey("raw", passwordHash, algorithm.name, false, [
        "encrypt",
        "decrypt"
    ])
    const cipher = await crypto.subtle.encrypt(algorithm, key, blockAddress.serializeBinary())
    return encodeBase64(cipher)
}

export async function decryptBlockAddress(
    blockAddress: string
): Promise<BlockAddress> {
    const passwordHash = new Digest().update(new TextEncoder().encode(password)).sum()
    const key = await crypto.subtle.importKey("raw", passwordHash, algorithm.name, false, [
        "encrypt",
        "decrypt"
    ])

    const plain = await crypto.subtle.decrypt(algorithm, key, decodeBase64(blockAddress))
    return BlockAddress.deserializeBinary(new Uint8Array(plain))
}


describe("Identity", () => {
    it("create block address", function() {
        const blockAddress = createBlockAddress()
        expect(blockAddress.getAddress().length).toEqual(42)
    })

    it("encrypt and decrypt block address", async () => {
        const blockAddress1 = createBlockAddress()
        const cipher = await encryptBlockAddress(blockAddress1)
        const blockAddress2 = await decryptBlockAddress(cipher)
        expect(blockAddress2.serializeBinary()).toStrictEqual(blockAddress1.serializeBinary())
    })

    it("recovery from mnemonic", function() {
        const mnemonic = new Mnemonic()
        mnemonic.setPath("m/44'/60'/0'/0/0")
        mnemonic.setPassword("")
        mnemonic.setLocale("zh_cn")
        mnemonic.setPhrase("撒 达 生 摸 对 帝 午 伤 紫 拟 妥 万")

        const blockAddress1 = new BlockAddress()
        blockAddress1.setPublickey("0x0336a4339191a3e3b05e82b8d8b34e3a28b26426aa5d117c38cdf7d64ef965e8fd")
        blockAddress1.setPrivatekey("0xbdd197f283b7ee9986ae25a63da92d6ad158493cfca29c9eb750568662105453")
        blockAddress1.setAddress("0x3B57109aA45e8BDB69c1CE23F9fCf05fB43AF0bd")
        blockAddress1.setIdentifier("did:ethr:0x07e4:0x0336a4339191a3e3b05e82b8d8b34e3a28b26426aa5d117c38cdf7d64ef965e8fd")
        blockAddress1.setMnemonic(mnemonic)

        const blockAddress2 = recoveryFromMnemonic(mnemonic, NetworkTypeEnum.NETWORK_TYPE_YEYING)
        expect(blockAddress1.serializeBinary()).toEqual(blockAddress2.serializeBinary())
    })

    it("sign and verify identity", async () => {
        const blockAddress = createBlockAddress()
        const encryptedBlockAddress = await encryptBlockAddress(blockAddress)

        const extend = new IdentityApplicationExtend()
        extend.setCode("APPLICATION_CODE_WAREHOUSE")
        extend.setServicecodesList(["SERVICE_CODE_AGENT"])
        extend.setLocation("location1")
        extend.setHash("hash1")
        const algorithm = new SecurityAlgorithm()
        algorithm.setName("CIPHER_TYPE_AES_GCM_256")
        algorithm.setIv(encodeBase64(iv))
        const securityConfig = new SecurityConfig()
        securityConfig.setAlgorithm(algorithm)
        const template: IdentityTemplate = {
            language: "LANGUAGE_CODE_ZH_CH",
            parent: "",
            network: NetworkTypeEnum.NETWORK_TYPE_YEYING,
            code: IdentityCodeEnum.IDENTITY_CODE_APPLICATION,
            name: "name1",
            description: "description1",
            avatar: "avatar1",
            extend: extend,
            securityConfig: securityConfig
        }

        const identity = await createIdentity(
            blockAddress,
            encryptedBlockAddress,
            template)

        const success = await verifyIdentity(identity)
        expect(success).toBeTruthy()
    })

    it("update identity", async () => {
        const blockAddress = createBlockAddress()
        const encryptedBlockAddress = await encryptBlockAddress(blockAddress)

        const extend = new IdentityPersonalExtend()
        extend.setEmail("email1")
        extend.setTelephone("telephone1")
        extend.setExtend("extend1")
        const algorithm = new SecurityAlgorithm()
        algorithm.setName("CIPHER_TYPE_AES_GCM_256")
        algorithm.setIv(encodeBase64(iv))
        const securityConfig = new SecurityConfig()
        securityConfig.setAlgorithm(algorithm)
        const template: IdentityTemplate = {
            language: "LANGUAGE_CODE_ZH_CH",
            parent: "",
            network: NetworkTypeEnum.NETWORK_TYPE_YEYING,
            code: IdentityCodeEnum.IDENTITY_CODE_PERSONAL,
            name: "name1",
            description: "description1",
            avatar: "avatar1",
            extend: extend,
            securityConfig: securityConfig
        }

        const identity = await createIdentity(
            blockAddress,
            encryptedBlockAddress,
            template)

        template.name = "name2"
        template.avatar = "avatar2"
        extend.setEmail("email2")

        const newIdentity = await updateIdentity(template, identity, blockAddress)
        expect(newIdentity.getMetadata()?.getName()).toEqual("name2")
        expect(newIdentity.getMetadata()?.getAvatar()).toEqual("avatar2")
        expect(newIdentity.getPersonalextend()?.getEmail()).toEqual("email2")
    })
})