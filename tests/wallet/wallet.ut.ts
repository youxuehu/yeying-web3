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
} from "../../src/yeying/api/web3/web3"
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
    const cipher = await crypto.subtle.encrypt(algorithm, key, BlockAddress.encode(blockAddress).finish())
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
    return BlockAddress.decode(new Uint8Array(plain))
}


describe("Identity", () => {
    it("create block address", function() {
        const blockAddress = createBlockAddress()
        expect(blockAddress.address.length).toEqual(42)
    })

    it("encrypt and decrypt block address", async () => {
        const blockAddress1 = createBlockAddress()
        const cipher = await encryptBlockAddress(blockAddress1)
        const blockAddress2 = await decryptBlockAddress(cipher)
        expect(BlockAddress.encode(blockAddress2).finish()).toStrictEqual(BlockAddress.encode(blockAddress1).finish())
    })

    it("recovery from mnemonic", function() {
        const mnemonic = Mnemonic.create({
            path: "m/44'/60'/0'/0/0",
            locale: "zh_cn",
            password: "",
            phrase: "撒 达 生 摸 对 帝 午 伤 紫 拟 妥 万"
        })

        const blockAddress1 = BlockAddress.create({
            publicKey: "0x0336a4339191a3e3b05e82b8d8b34e3a28b26426aa5d117c38cdf7d64ef965e8fd",
            privateKey: "0xbdd197f283b7ee9986ae25a63da92d6ad158493cfca29c9eb750568662105453",
            address: "0x3B57109aA45e8BDB69c1CE23F9fCf05fB43AF0bd",
            identifier: "did:ethr:0x07e4:0x0336a4339191a3e3b05e82b8d8b34e3a28b26426aa5d117c38cdf7d64ef965e8fd",
            mnemonic: mnemonic
        })

        const blockAddress2 = recoveryFromMnemonic(mnemonic, NetworkTypeEnum.NETWORK_TYPE_YEYING)
        expect(BlockAddress.encode(blockAddress1).finish()).toEqual(BlockAddress.encode(blockAddress2).finish())
    })

    it("sign and verify identity", async () => {
        const blockAddress = createBlockAddress()
        const encryptedBlockAddress = await encryptBlockAddress(blockAddress)

        const extend = IdentityApplicationExtend.create({
            code: "APPLICATION_CODE_WAREHOUSE",
            serviceCodes: ["SERVICE_CODE_AGENT"],
            location: "location1",
            hash: "hash1"
        })

        const algorithm = SecurityAlgorithm.create({
            name: "CIPHER_TYPE_AES_GCM_256",
            iv: encodeBase64(iv)
        })

        const securityConfig = SecurityConfig.create({
            algorithm: algorithm
        })

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

        const extend = IdentityPersonalExtend.create({
            email: "email1",
            telephone: "telephone1",
            extend: "extend1"
        })

        const algorithm = SecurityAlgorithm.create({
            name: "CIPHER_TYPE_AES_GCM_256",
            iv: encodeBase64(iv)
        })

        const securityConfig = SecurityConfig.create({
            algorithm: algorithm
        })

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
        extend.email = "email2"

        const newIdentity = await updateIdentity(template, identity, blockAddress)
        expect(newIdentity.metadata?.name).toEqual("name2")
        expect(newIdentity.metadata?.avatar).toEqual("avatar2")
        expect(newIdentity.personalExtend?.email).toEqual("email2")
    })
})