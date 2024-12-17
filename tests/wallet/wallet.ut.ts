import {
    createBlockAddress,
    createIdentity,
    decryptBlockAddress,
    encryptBlockAddress,
    recoveryFromMnemonic,
    verifyIdentity
} from "../../src/wallet/identity";
import {
    BlockAddress,
    IdentityApplicationExtend,
    Mnemonic,
    SecurityAlgorithm
} from "../../src/yeying/api/common/message";
import {ApplicationCodeEnum, CipherTypeEnum, IdentityCodeEnum, ServiceCodeEnum} from "../../src/yeying/api/common/code";
import {IdentityTemplate} from "../../src/wallet/model";
import {encodeBase64, generateIv} from "../../src/common/cipher";


describe('BlockAddress', () => {
    it('create', function () {
        const blockAddress = createBlockAddress()
        console.log(`${JSON.stringify(blockAddress, null, 2)}`)
        expect(blockAddress.address.length).toEqual(42)
    })

    it('encrypt and decrypt', async () => {
        const blockAddress1 = createBlockAddress()
        const algorithm = SecurityAlgorithm.create({
            type: CipherTypeEnum.CIPHER_TYPE_AES_GCM_256,
            iv: encodeBase64(generateIv())
        })
        const password = "123456"
        const cipher = await encryptBlockAddress(blockAddress1, algorithm, password)
        const blockAddress2 = await decryptBlockAddress(cipher, algorithm, password)
        expect(blockAddress2).toEqual(blockAddress1)
    })

    it('recovery', function () {
        const mnemonic: Mnemonic = {
            "phrase": "撒 达 生 摸 对 帝 午 伤 紫 拟 妥 万",
            "locale": "zh_cn",
            "path": "m/44'/60'/0'/0/0",
            "password": "",
        }
        const blockAddress1: BlockAddress = {
            "privateKey": "0xbdd197f283b7ee9986ae25a63da92d6ad158493cfca29c9eb750568662105453",
            "address": "0x3B57109aA45e8BDB69c1CE23F9fCf05fB43AF0bd",
            "publicKey": "0x0336a4339191a3e3b05e82b8d8b34e3a28b26426aa5d117c38cdf7d64ef965e8fd",
            "identifier": "did:ethr:0x07e4:0x0336a4339191a3e3b05e82b8d8b34e3a28b26426aa5d117c38cdf7d64ef965e8fd",
            "mnemonic": mnemonic
        }
        const blockAddress2 = recoveryFromMnemonic(mnemonic)

        console.log(`blockAddress1=${JSON.stringify(blockAddress1, null, 2)}`)
        console.log(`blockAddress2=${JSON.stringify(blockAddress2, null, 2)}`)
        expect(blockAddress1.address).toEqual(blockAddress2.address)
    })
})

describe("Identity", () => {
    it('sign and verify', async () => {
        const password = "123456"
        const template: IdentityTemplate = {
            parent: "",
            code: IdentityCodeEnum.IDENTITY_CODE_APPLICATION,
            name: "name1",
            description: "description1",
            avatar: "avatar1",
            extend: IdentityApplicationExtend.create({
                code: ApplicationCodeEnum.APPLICATION_CODE_WAREHOUSE,
                serviceCodes: [ServiceCodeEnum.SERVICE_CODE_AGENT],
                location: "location1",
                hash: "hash1",
                securityConfig: {
                    algorithm: {
                        type: CipherTypeEnum.CIPHER_TYPE_AES_GCM_256,
                        iv: encodeBase64(generateIv())
                    }
                }
            })
        }
        const identity = await createIdentity(password, template)
        console.log(`identity=${JSON.stringify(identity, null, 2)}`)
        const success = await verifyIdentity(identity)
        expect(success).toBeTruthy()
    })

})
