import {createRandom, fromMnemonic} from "../../src/wallet/wallet";
import {BlockAddress, Mnemonic} from "../../src/wallet/model";

describe('BlockAddress', () => {
    it('create', function () {
        const blockAddress = createRandom()
        console.log(`${JSON.stringify(blockAddress)}, address length=${blockAddress.address.length}`)
        expect(blockAddress.address.length).toEqual(42)
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
        const blockAddress2 = fromMnemonic(mnemonic)

        console.log(`blockAddress1=${JSON.stringify(blockAddress1)}`)
        console.log(`blockAddress2=${JSON.stringify(blockAddress2)}`)
        expect(blockAddress1.address).toEqual(blockAddress2.address)
    })
})