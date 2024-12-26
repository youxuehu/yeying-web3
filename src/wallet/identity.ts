import { fromDidToPublicKey, trimLeft } from '../common/codec'
import { computeAddress, defaultPath, HDNodeWallet, Wordlist, wordlists } from 'ethers'
import elliptic from 'elliptic'
import {
    BlockAddress,
    Identity,
    IdentityApplicationExtend,
    IdentityCodeEnum,
    IdentityMetadata,
    IdentityOrganizationExtend,
    IdentityPersonalExtend,
    IdentityServiceExtend,
    Mnemonic,
    NetworkTypeEnum
} from '../yeying/api/web3/web3_pb'
import { constructIdentifier, IdentityTemplate } from './model'
import { getCurrentUtcString } from '../common/date'
import { Digest } from '../common/digest'

export function recoveryFromMnemonic(mnemonic: Mnemonic, networkType: number) {
    const wallet = HDNodeWallet.fromPhrase(
        mnemonic.getPhrase(),
        mnemonic.getPassword(),
        mnemonic.getPath(),
        wordlists[mnemonic.getLocale()]
    )
    return buildBlockAddress(networkType, wallet, mnemonic.getPath())
}

export function createBlockAddress(
    network: NetworkTypeEnum = NetworkTypeEnum.NETWORK_TYPE_YEYING,
    language: string = 'LANGUAGE_CODE_ZH_CH',
    password: string = '',
    path: string = defaultPath
): BlockAddress {
    let wordlist: Wordlist
    switch (language) {
        case 'LANGUAGE_CODE_ZH_CH':
            wordlist = wordlists['zh_cn']
        case 'LANGUAGE_CODE_EN_US':
            wordlist = wordlists['en']
        default:
            wordlist = wordlists['zh_cn']
    }

    const wallet = HDNodeWallet.createRandom(password, path, wordlist)
    return buildBlockAddress(network, wallet, path)
}

export async function updateIdentity(template: IdentityTemplate, identity: Identity, blockAddress: BlockAddress) {
    // 判断身份是否有效
    let isValid = await verifyIdentity(identity)
    if (!isValid) {
        throw new Error('Invalid identity!')
    }

    // 克隆身份
    const newIdentity: Identity = Identity.deserializeBinary(identity.serializeBinary())

    // 更新元信息
    const metadata = newIdentity.getMetadata() as IdentityMetadata
    metadata.setName(template.name)
    metadata.setDescription(template.description)
    metadata.setParent(template.parent)
    metadata.setCode(template.code)
    metadata.setAvatar(template.avatar)
    metadata.setVersion(metadata.getVersion() + 1)
    metadata.setCheckpoint(getCurrentUtcString())

    // 更新安全信息
    newIdentity.setSecurityconfig(template.securityConfig)

    // 更新扩展信息
    if (template.extend) {
        switch (template.code) {
            case IdentityCodeEnum.IDENTITY_CODE_PERSONAL:
                newIdentity.setPersonalextend(template.extend as IdentityPersonalExtend)
                break
            case IdentityCodeEnum.IDENTITY_CODE_ORGANIZATION:
                newIdentity.setOrganizationextend(template.extend as IdentityOrganizationExtend)
                break
            case IdentityCodeEnum.IDENTITY_CODE_SERVICE:
                newIdentity.setServiceextend(template.extend as IdentityServiceExtend)
                break
            case IdentityCodeEnum.IDENTITY_CODE_APPLICATION:
                newIdentity.setApplicationextend(template.extend as IdentityApplicationExtend)
                break
            default:
                throw new Error(`Not supported identity code=${template.code}`)
        }
    }

    // 更新签名
    await signIdentity(blockAddress.getPrivatekey(), newIdentity)

    // 验证公私钥是否匹配
    isValid = await verifyIdentity(identity)
    if (!isValid) {
        throw new Error('Invalid blockAddress!')
    }

    return newIdentity
}

export async function createIdentity(
    blockAddress: BlockAddress,
    encryptedBlockAddress: string,
    template: IdentityTemplate
) {
    const identity = new Identity()
    identity.setBlockaddress(encryptedBlockAddress)
    const metadata = new IdentityMetadata()
    metadata.setNetwork(template.network)
    metadata.setDid(blockAddress.getIdentifier())
    metadata.setAddress(blockAddress.getAddress())
    metadata.setName(template.name)
    metadata.setDescription(template.description)
    metadata.setParent(template.parent)
    metadata.setCode(template.code)
    metadata.setAvatar(template.avatar)
    metadata.setVersion(0)
    metadata.setCreated(getCurrentUtcString())
    metadata.setCheckpoint(getCurrentUtcString())
    identity.setMetadata(metadata)
    identity.setSecurityconfig(template.securityConfig)
    // 签名身份
    await signIdentity(blockAddress.getPrivatekey(), identity)

    // 验证公私钥是否匹配
    const isValid = await verifyIdentity(identity)
    if (!isValid) {
        throw new Error('Invalid blockAddress!')
    }

    return identity
}

export async function signIdentity(privateKey: string, identity: Identity) {
    identity.setSignature('')
    const signature = await signData(privateKey, identity.serializeBinary())
    identity.setSignature(signature)
}

export async function verifyIdentity(identity: Identity) {
    const signature = identity.getSignature()
    try {
        identity.setSignature('')
        const publicKey = fromDidToPublicKey((identity.getMetadata() as IdentityMetadata).getDid())
        return await verifyData(publicKey, identity.serializeBinary(), signature)
    } finally {
        identity.setSignature(signature)
    }
}

export async function verifyData(publicKey: string, data: Uint8Array, signature: string) {
    return await verifyHashBytes(publicKey, new Digest().update(data).sum(), signature)
}

export async function verifyHashBytes(publicKey: string, hashBytes: Uint8Array, signature: string) {
    const ec = new elliptic.ec('secp256k1')
    const pubKeyEc = ec.keyFromPublic(trimLeft(publicKey, '0x'), 'hex')
    return pubKeyEc.verify(hashBytes, signature)
}

export async function signData(privateKey: string, data: Uint8Array) {
    return signHashBytes(privateKey, new Digest().update(data).sum())
}

export async function signHashBytes(privateKey: string, hashBytes: Uint8Array) {
    const ec = new elliptic.ec('secp256k1')
    const keyPair = ec.keyFromPrivate(trimLeft(privateKey, '0x'), 'hex')
    const signature = keyPair.sign(hashBytes, { canonical: true })
    return signature.toDER('hex')
}

function buildBlockAddress(networkType: number, wallet: HDNodeWallet, path: string): BlockAddress {
    const blockAddress = new BlockAddress()
    blockAddress.setPrivatekey(wallet.privateKey)
    blockAddress.setAddress(computeAddress(wallet.privateKey))
    blockAddress.setPublickey(wallet.publicKey)
    blockAddress.setIdentifier(constructIdentifier(networkType, wallet.publicKey))

    if (wallet.mnemonic !== null) {
        const mnemonic = new Mnemonic()
        mnemonic.setPath(path)
        mnemonic.setPassword(wallet.mnemonic.password)
        mnemonic.setPhrase(wallet.mnemonic.phrase)
        mnemonic.setLocale(wallet.mnemonic.wordlist.locale)
        blockAddress.setMnemonic(mnemonic)
    }

    return blockAddress
}
