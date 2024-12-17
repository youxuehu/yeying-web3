import {IdentityCodeEnum, LanguageCodeEnum, NetworkTypeEnum} from "../yeying/api/common/code";
import {
    BlockAddress,
    IdentityApplicationExtend,
    IdentityMetadata,
    IdentityOrganizationExtend,
    IdentityPersonalExtend,
    IdentityServiceExtend, Mnemonic,
    SecurityAlgorithm
} from "../yeying/api/common/message";
import {constructIdentifier, decodeBase64, getCurrentUtcString, Identity, IdentityTemplate} from "./model";
import {computeHash, decrypt, encrypt, fromDidToPublicKey, sign, verify} from "../common/cipher";
import {computeAddress, defaultPath, HDNodeWallet, Wordlist, wordlists} from "ethers";

export function recoveryFromMnemonic(mnemonic: Mnemonic, networkType = NetworkTypeEnum.NETWORK_TYPE_YEYING) {
    const wallet = HDNodeWallet.fromPhrase(mnemonic.phrase, mnemonic.password, mnemonic.path, wordlists[mnemonic.locale])
    return buildBlockAddress(networkType, wallet, mnemonic.path)
}

export function createBlockAddress(networkType = NetworkTypeEnum.NETWORK_TYPE_YEYING, language: LanguageCodeEnum = LanguageCodeEnum.LANGUAGE_CODE_ZH_CH, password: string = "", path: string = defaultPath): BlockAddress {
    let wordlist: Wordlist
    switch (language) {
        case LanguageCodeEnum.LANGUAGE_CODE_ZH_CH:
            wordlist = wordlists['zh_cn']
        case LanguageCodeEnum.LANGUAGE_CODE_EN_US:
            wordlist = wordlists['en']
        default:
            wordlist = wordlists['zh_cn']
    }

    const wallet = HDNodeWallet.createRandom(password, path, wordlist)
    return buildBlockAddress(networkType, wallet, path)
}

export function updateIdentity(password: string, template: IdentityTemplate, identity: Identity) {
    const newIdentity = structuredClone(identity)
    newIdentity.metadata.name = template.name
    newIdentity.metadata.description = template.description
    newIdentity.metadata.parent = template.parent
    newIdentity.metadata.code = template.code
    newIdentity.metadata.avatar = template.avatar
    newIdentity.extend = template.extend
    newIdentity.metadata.version = identity.metadata.version + 1
    newIdentity.metadata.checkpoint = getCurrentUtcString()

    const algorithm = template.extend.securityConfig?.algorithm
    if (algorithm === undefined) {
        throw new Error("Unknown algorithm")
    }

    const blockAddress = decryptBlockAddress(identity.blockAddress, algorithm, password)
    newIdentity.signature = signIdentity(blockAddress.privateKey, newIdentity)
    return newIdentity
}

export function createIdentity(password: string, template: IdentityTemplate) {
    const blockAddress = createBlockAddress()
    const metadata = IdentityMetadata.create({
        network: NetworkTypeEnum.NETWORK_TYPE_UNKNOWN,
        version: 0,
        did: blockAddress.identifier,
        address: blockAddress.address,
        parent: template.parent,
        name: template.name,
        description: template.description,
        code: template.code,
        avatar: template.avatar,
        created: getCurrentUtcString(),
        checkpoint: getCurrentUtcString()
    })

    const algorithm = template.extend.securityConfig?.algorithm
    if (algorithm === undefined) {
        throw new Error("Unknown algorithm")
    }

    const identity: Identity = {
        metadata: metadata,
        blockAddress: encryptBlockAddress(blockAddress, algorithm, password),
        extend: template.extend,
        signature: "",
    }

    identity.signature = signIdentity(blockAddress.privateKey, identity)
    return identity
}

export function encryptBlockAddress(blockAddress: BlockAddress, algorithm: SecurityAlgorithm, password: string): string {
    return encrypt(algorithm.type, computeHash(password), decodeBase64(algorithm.iv), BlockAddress.encode(blockAddress).finish())
}

export function decryptBlockAddress(blockAddress: string, algorithm: SecurityAlgorithm, password: string): BlockAddress {
    return BlockAddress.decode(decrypt(algorithm.type, computeHash(password), decodeBase64(algorithm.iv), blockAddress))
}

export function verifyIdentity(identity: Identity): boolean {
    return verify(fromDidToPublicKey(identity.metadata.did), serializeIdentity(identity), identity.signature)
}

export function signIdentity(privateKey: string, identity: Identity): string {
    return sign(privateKey, serializeIdentity(identity))
}

function serializeIdentity(identity: Identity): Uint8Array {
    const binaryWriter = IdentityMetadata.encode(identity.metadata);
    binaryWriter.string(identity.blockAddress)
    switch (identity.metadata.code) {
        case IdentityCodeEnum.IDENTITY_CODE_SERVICE:
            IdentityServiceExtend.encode(<IdentityServiceExtend>identity.extend, binaryWriter)
            break
        case IdentityCodeEnum.IDENTITY_CODE_APPLICATION:
            IdentityApplicationExtend.encode(<IdentityApplicationExtend>identity.extend, binaryWriter)
            break
        case IdentityCodeEnum.IDENTITY_CODE_PERSONAL:
            IdentityPersonalExtend.encode(<IdentityPersonalExtend>identity.extend, binaryWriter)
            break
        case IdentityCodeEnum.IDENTITY_CODE_ORGANIZATION:
            IdentityOrganizationExtend.encode(<IdentityOrganizationExtend>identity.extend, binaryWriter)
            break
        default:
            throw new Error(`Not supported identity code=${identity.metadata.code}`)
    }
    return binaryWriter.finish()
}

function buildBlockAddress(networkType: NetworkTypeEnum, wallet: HDNodeWallet, path: string): BlockAddress {
    const blockAddress = BlockAddress.create({
        privateKey: wallet.privateKey,
        address: computeAddress(wallet.privateKey),
        publicKey: wallet.publicKey,
        identifier: constructIdentifier(networkType, wallet.publicKey)
    })

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


