import {Account, Chain} from '../src/index'
import {BlockAddress} from '../src/model/BlockAddress'

jest.setTimeout(30000)
describe('index', () => {
    let blockAddress: BlockAddress

    beforeAll(() => {
        blockAddress = {
            address: '0xB49Fedf23ccdB02C84A1649A4e44929Add12e977',
            privateKey: '0xbe7798130f32c0d4c611e64b3e3892adfee1e1d0c1035b8899c6ae3401c3ac4c',
            publicKey: '0x03fb9ae91136a0f31847b3559f7f7563f6a527fd76187f26a2c5c1591ddea16233',
            identifier: 'did:ethr:0x7e4:0x03fb9ae91136a0f31847b3559f7f7563f6a527fd76187f26a2c5c1591ddea16233'
        }
    })

    describe('account', () => {
        it('instantiate', async () => {
            const signer = Chain.getDefaultSigner(blockAddress.privateKey)
            const account = new Account({
                identifier: blockAddress.identifier,
                provider: Chain.getDefaultProvider(),
                signer: signer,
                contract: Chain.getDefaultContract(signer)
            })
            expect(await account.getOwner()).toBe('0xB49Fedf23ccdB02C84A1649A4e44929Add12e977')
        })
    })
})