import * as os from 'os'
import {ethers} from 'ethers'
import {Blockchain} from '../../src/contract/Blockchain'

test('Get contract', () => {
    const provider = new ethers.providers.IpcProvider(`${os.homedir()}/eth/yeying/data/geth.ipc`)
    const contract = Blockchain.getDefaultContract(provider.getSigner())
    console.log(`registry address=${contract.address}`)
    expect(contract).toBeDefined()
})
