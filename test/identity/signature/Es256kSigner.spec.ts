import {Es256kSigner} from '../../../src/account/signature/Es256kSigner'
import {Blockchain} from '../../../src/contract/Blockchain'
import {hexToBytes} from '../../../src/tool/string'


test('Sign and verify for 256k', async () => {
    const account = Blockchain.createBlockAddress()

    const data = 'hello world'
    const signer1 = new Es256kSigner(true, hexToBytes(account.privateKey))
    const signature1 = await signer1.sign(data)
    console.log(`The sign for hello world is ${signature1}`)
    const passed1 = signer1.verify(data, signature1, account.publicKey)
    console.log(`1 Result=${passed1}`)
    expect(passed1).toBeTruthy()

    const signer2 = new Es256kSigner(false, hexToBytes(account.privateKey))
    const signature2 = await signer2.sign(data)
    console.log(`The sign for hello world is ${signature2}`)
    const passed2 = signer2.verify(data, signature2, account.publicKey)
    console.log(`2 Result=${passed2}`)
    expect(passed2).toBeTruthy()
})