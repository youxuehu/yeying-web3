import {constructIdentifier, parseIdentifier} from '../../src/tool/string'
import {NetworkType} from '../../src/model/Constant'
import {Blockchain} from '../../src/contract/Blockchain'
import {Identity} from '../../src/account/Identity'
import {BlockAddress} from '../../src'
import {DelegateType} from '../../src/model/Erc1056Event'
import {Es256kSigner} from '../../src/account/signature/Es256kSigner'
import {wordlists} from "ethers";

jest.setTimeout(60000)
describe('Did identity', function () {
    let account: BlockAddress

    beforeAll(() => {
        account = {
            address: '0x82EBDA6142A7fDaB77FC85564c77B211262fE284',
            privateKey: '0xecefee2349ed19bb49ce7b34e635add67b3422815f9d2cd693807cebeb38cb9a',
            publicKey: '0x0232d2a003594b73f42b4137bc62c3322ca3c8a3789d8128a19e9292473b1a8fdb',
            identifier: 'did:ethr:0x7e4:0x0232d2a003594b73f42b4137bc62c3322ca3c8a3789d8128a19e9292473b1a8fdb'
        }
    })

    describe('Crud', () => {
        it('Create a did', () => {
            const blockchain = Blockchain.createBlockAddress(NetworkType.YeYing, wordlists.zh_cn)
            console.log(blockchain)
            const identifier = constructIdentifier(NetworkType.YeYing, blockchain.publicKey)
            console.log(identifier)

            const identityAddress = parseIdentifier(identifier)
            expect(identityAddress.networkType).toEqual(NetworkType.YeYing)
            expect(identityAddress.publicKey).toEqual(blockchain.publicKey)
        })
    })

    describe('Jwt', () => {
        it('Sign with jwt', async () => {
            const provider = Blockchain.getDefaultProvider()
            const s = Blockchain.getDefaultSigner(account.privateKey)
            const contract = Blockchain.getDefaultContract(s)

            const identity = new Identity({
                identifier: account.identifier,
                signer: s,
                contract: contract,
                provider: provider
            })

            const {ba} = await identity.createSigningDelegate(DelegateType.VerifyKey)
            const jwt = await identity.signJWT(new Es256kSigner(true, ba.privateKey), {hello: 'world'})
            console.log(`jwt=${JSON.stringify(jwt)}`)
            const verification = await identity.verifyJWT(jwt)
            console.log(`verify=${JSON.stringify(verification)}`)
            const {signer} = verification
            const {id, type, controller, blockchainAccountId} = signer
            expect(id).toContain(`${account.identifier}#delegate-`)
            expect(type).toBe('EcdsaSecp256k1RecoveryMethod2020')
            expect(controller).toBe(account.identifier)
            expect(blockchainAccountId).toBe(`eip155:2020:${ba.address}`)
        })
    })
})