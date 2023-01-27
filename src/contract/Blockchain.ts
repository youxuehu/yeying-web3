import {Wallet} from '@ethersproject/wallet'
import {computeAddress} from '@ethersproject/transactions'
import {computePublicKey} from '@ethersproject/signing-key'
import {BlockAddress} from '../model/BlockAddress'
import {Provider} from '@ethersproject/providers'
import {ethers, Signer} from 'ethers'
import os from 'os'
import {Contract, ContractFactory} from '@ethersproject/contracts'
import {DeployedDidContract, NetworkType} from '../model/Constant'
import {DidRegistry} from './DidRegistry.json'
import {constructIdentifier} from '../tool/string'

export class Blockchain {

    static createBlockAddress(networkType = NetworkType.YeYing): BlockAddress {
        const wallet = Wallet.createRandom()
        const privateKey = wallet.privateKey
        const address = computeAddress(privateKey)
        const publicKey = computePublicKey(privateKey, true)
        return {
            address: address,
            privateKey: privateKey,
            publicKey: publicKey,
            identifier: constructIdentifier(networkType, publicKey)
        }
    }

    static getDefaultProvider(ipc?: string): Provider {
        return new ethers.providers.IpcProvider(ipc || `${os.homedir()}/eth/yeying/data/geth.ipc`)
    }

    static getDefaultSigner(privateKey: string, ipc?: string): Signer {
        return new ethers.Wallet(privateKey, Blockchain.getDefaultProvider(ipc))
    }

    static getDefaultContract(signer: Signer, networkType?: NetworkType, registry?: string): Contract {
        const network = NetworkType[networkType || NetworkType.YeYing]
        return ContractFactory.fromSolidity(DidRegistry)
            .attach(registry || DeployedDidContract[network as keyof typeof DeployedDidContract])
            .connect(signer)
    }
}