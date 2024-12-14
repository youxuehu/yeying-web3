import {BlockAddress, Language, Mnemonic, NetworkType} from "./model";
import {computeAddress, toBeHex, wordlists, HDNodeWallet, defaultPath, Wallet, Wordlist} from "ethers";

export function constructIdentifier(network: NetworkType, publicKey: string): string {
    return `did:ethr:${toBeHex(network)}:${publicKey}`;
}

export function fromMnemonic(mnemonic: Mnemonic, networkType = NetworkType.YeYing) {
    const wallet = HDNodeWallet.fromPhrase(mnemonic.phrase, mnemonic.password, mnemonic.path, wordlists[mnemonic.locale])
    return extractBlockAddressFromWallet(networkType, wallet, mnemonic.path)
}

export function createRandom(networkType = NetworkType.YeYing, language: Language = Language.ZH_CN, password: string = "", path: string = defaultPath): BlockAddress {
    let wordlist: Wordlist
    switch (language) {
        case Language.ZH_CN:
            wordlist = wordlists['zh_cn']
        case Language.EN_US:
            wordlist = wordlists['en']
        default:
            wordlist = wordlists['zh_cn']
    }

    const wallet = HDNodeWallet.createRandom(password, path, wordlist)
    return extractBlockAddressFromWallet(networkType, wallet, path)
}

function extractBlockAddressFromWallet(networkType: NetworkType, wallet: HDNodeWallet, path: string): BlockAddress {
    const blockAddress = {
        privateKey: wallet.privateKey,
        address: computeAddress(wallet.privateKey),
        publicKey: wallet.publicKey,
        identifier: constructIdentifier(networkType, wallet.publicKey)
    }

    let mnemonic = wallet.mnemonic
    if (mnemonic !== null) {
        return {
            ...blockAddress,
            mnemonic: {
                phrase: mnemonic.phrase,
                locale: mnemonic.wordlist.locale,
                path: path,
                password: mnemonic.password,
            }
        }
    }
    return blockAddress
}
