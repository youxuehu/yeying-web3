import {Blockchain} from '../../src/contract/Blockchain'
import {NetworkType} from "../../src";
import {Wordlist, wordlists} from "ethers";

describe('Create block address', () => {
    it('Create random', function () {
        const blockAddress = Blockchain.createBlockAddress()
        console.log(`${JSON.stringify(blockAddress)}, address length=${blockAddress.address.length}`)
        expect(blockAddress.address.length).toEqual(42)
    })

    it('Create with Mnemonic', function () {
        const localeList: Wordlist[] = [wordlists.zh_cn, wordlists.en]
        for(let l of localeList) {
            const blockAddress1 = Blockchain.createBlockAddress(NetworkType.YeYing, l)
            console.log(`${JSON.stringify(blockAddress1)}, address length=${blockAddress1.address.length}`)
            expect(blockAddress1.address.length).toEqual(42)
            expect(blockAddress1.mnemonic).toBeDefined()

            const locale = blockAddress1?.mnemonic?.locale
            const blockAddress2 = Blockchain.createBlockAddress(
                NetworkType.YeYing, locale === undefined ? undefined : wordlists[locale], blockAddress1?.mnemonic?.phrase)
            console.log(`${JSON.stringify(blockAddress2)}`)
            expect(blockAddress1.address).toEqual(blockAddress2.address)
        }
    })
})
