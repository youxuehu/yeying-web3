import {Wallet} from '@ethersproject/wallet'
import {computeAddress} from '@ethersproject/transactions'
import {computePublicKey} from '@ethersproject/signing-key'
import {BlockAddress} from '../model/BlockAddress'
import {Provider} from '@ethersproject/providers'
import {ethers, Signer, utils, Wordlist} from 'ethers'
import os from 'os'
import {Contract, ContractFactory} from '@ethersproject/contracts'
import {DeployedDidContract, NetworkType, ProviderType} from '../model/Constant'
import {DidRegistry} from './DidRegistry.json'
import {constructIdentifier} from '../tool/string'

export class Blockchain {
    static createBlockAddress(networkType = NetworkType.YeYing, wordlist?: Wordlist, mnemonic?: string): BlockAddress {
        let wallet: Wallet;
        if (Wordlist !== undefined) {
            const words = mnemonic === undefined ? utils.entropyToMnemonic(utils.randomBytes(24), wordlist) : mnemonic
            wallet = Wallet.fromMnemonic(words, undefined, wordlist)
        } else {
            wallet = Wallet.createRandom()
        }

        const privateKey = wallet.privateKey
        const address = computeAddress(privateKey)
        const publicKey = computePublicKey(privateKey, true)
        return {
            address: address,
            mnemonic: wallet.mnemonic,
            privateKey: privateKey,
            publicKey: publicKey,
            identifier: constructIdentifier(networkType, publicKey)
        }
    }

    static getDefaultProvider(type: ProviderType, url?: string): Provider {
        switch (type) {
            case ProviderType.http:
                return new ethers.providers.JsonRpcProvider(url || 'https://www.yeying.pub')
            case ProviderType.ipc:
                return new ethers.providers.IpcProvider(url || `${os.homedir()}/eth/yeying/data/geth.ipc`);
            case ProviderType.ws:
                return new ethers.providers.WebSocketProvider(url || 'ws://www.yeying.pub');
            default:
                throw new Error(`Invalid provider type: ${type}`);
        }
    }

    static getDefaultSigner(privateKey: string, type: ProviderType = ProviderType.ipc, url?: string): Signer {
        return new ethers.Wallet(privateKey, Blockchain.getDefaultProvider(type, url))
    }

    static getDefaultContract(signer: Signer, networkType?: NetworkType, registry?: string): Contract {
        const network = NetworkType[networkType || NetworkType.YeYing]
        return ContractFactory.fromSolidity(DidRegistry)
            .attach(registry || DeployedDidContract[network as keyof typeof DeployedDidContract])
            .connect(signer)
    }
}