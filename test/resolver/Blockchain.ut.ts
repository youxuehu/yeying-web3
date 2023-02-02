import {Blockchain} from '../../src/contract/Blockchain'

describe('Create block address', () => {
    it('Create', function () {
        const blockAddress = Blockchain.createBlockAddress()
        console.log(`${JSON.stringify(blockAddress)}, address length=${blockAddress.address.length}`)
        expect(blockAddress.address.length).toEqual(42)
    })
})
