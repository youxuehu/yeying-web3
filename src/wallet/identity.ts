import { fromDidToPublicKey, trimLeft } from "../common/codec"
import { computeAddress, defaultPath, HDNodeWallet, Wordlist, wordlists } from "ethers"
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
    NetworkTypeEnum,
    SecurityConfig
} from "../yeying/api/web3/web3"
import { constructIdentifier, IdentityTemplate } from "./model"
import { getCurrentUtcString } from "../common/date"
import { Digest } from "../common/digest"
import { signHashBytes, verifyHashBytes } from "../common/signature"
import elliptic from "elliptic"

export function recoveryFromMnemonic(mnemonic: Mnemonic, networkType: NetworkTypeEnum) {
    const wallet = HDNodeWallet.fromPhrase(
        mnemonic.phrase,
        mnemonic.password,
        mnemonic.path,
        wordlists[mnemonic.locale]
    )
    return buildBlockAddress(networkType, wallet, mnemonic.path)
}

export function deriveFromBlockAddress(blockAddress: BlockAddress): Uint8Array {
    const ec = new elliptic.ec("secp256k1")
    const priKeyEc = ec.keyFromPrivate(trimLeft(blockAddress.privateKey, "0x"), "hex")
    const pubKeyEc = ec.keyFromPublic(trimLeft(blockAddress.publicKey, "0x"), "hex")
    const deriveKey = priKeyEc.derive(pubKeyEc.getPublic())
    return new Uint8Array(deriveKey.toArray("be"))
}

export function createBlockAddress(
    network: NetworkTypeEnum = NetworkTypeEnum.NETWORK_TYPE_YEYING,
    language: string = "LANGUAGE_CODE_ZH_CH",
    password: string = "",
    path: string = defaultPath
): BlockAddress {
    let wordlist: Wordlist
    switch (language) {
        case "LANGUAGE_CODE_ZH_CH":
            wordlist = wordlists["zh_cn"]
        case "LANGUAGE_CODE_EN_US":
            wordlist = wordlists["en"]
        default:
            wordlist = wordlists["zh_cn"]
    }

    const wallet = HDNodeWallet.createRandom(password, path, wordlist)
    return buildBlockAddress(network, wallet, path)
}

export async function updateIdentity(template: IdentityTemplate, identity: Identity, blockAddress: BlockAddress) {
    // 判断身份是否有效
    let isValid = await verifyIdentity(identity)
    if (!isValid) {
        throw new Error("Invalid identity!")
    }

    // 克隆身份
    const newIdentity: Identity = Identity.decode(Identity.encode(identity).finish())

    // 更新元信息
    const metadata = newIdentity.metadata as IdentityMetadata
    metadata.name = template.name
    metadata.description = template.description
    metadata.parent = template.parent
    metadata.code = template.code
    metadata.avatar = template.avatar
    metadata.version = metadata.version + 1
    metadata.checkpoint = getCurrentUtcString()

    // 更新安全信息
    if (template.securityConfig) {
        newIdentity.securityConfig = SecurityConfig.create(template.securityConfig)
    }

    // 更新扩展信息
    if (template.extend) {
        switch (template.code) {
            case IdentityCodeEnum.IDENTITY_CODE_PERSONAL:
                newIdentity.personalExtend = IdentityPersonalExtend.create(template.extend)
                break
            case IdentityCodeEnum.IDENTITY_CODE_ORGANIZATION:
                newIdentity.organizationExtend = IdentityOrganizationExtend.create(template.extend)
                break
            case IdentityCodeEnum.IDENTITY_CODE_SERVICE:
                newIdentity.serviceExtend = IdentityServiceExtend.create(template.extend)
                break
            case IdentityCodeEnum.IDENTITY_CODE_APPLICATION:
                newIdentity.applicationExtend = IdentityApplicationExtend.create(template.extend)
                break
            default:
                throw new Error(`Not supported identity code=${template.code}`)
        }
    }

    if (template.registry) {
        newIdentity.registry = template.registry
    }

    // 更新签名
    await signIdentity(blockAddress.privateKey, newIdentity)

    // 验证公私钥是否匹配
    isValid = await verifyIdentity(identity)
    if (!isValid) {
        throw new Error("Invalid blockAddress!")
    }

    return newIdentity
}

export async function createIdentity(
    blockAddress: BlockAddress,
    encryptedBlockAddress: string,
    template: IdentityTemplate
) {
    const metadata = IdentityMetadata.create({
        network: template.network,
        did: blockAddress.identifier,
        address: blockAddress.address,
        name: template.name,
        description: template.description,
        parent: template.parent,
        code: template.code,
        avatar: template.avatar,
        version: 0,
        created: getCurrentUtcString(),
        checkpoint: getCurrentUtcString()
    })

    const identity = Identity.create({
        blockAddress: encryptedBlockAddress,
        metadata: metadata,
        registry: template.registry
    })

    if (template.securityConfig) {
        identity.securityConfig = SecurityConfig.create(template.securityConfig)
    }

    if (template.extend) {
        switch (metadata.code) {
            case IdentityCodeEnum.IDENTITY_CODE_APPLICATION:
                identity.applicationExtend = IdentityApplicationExtend.create(template.extend)
                break
            case IdentityCodeEnum.IDENTITY_CODE_SERVICE:
                identity.serviceExtend = IdentityServiceExtend.create(template.extend)
                break
            case IdentityCodeEnum.IDENTITY_CODE_ORGANIZATION:
                identity.organizationExtend = IdentityOrganizationExtend.create(template.extend)
                break
            case IdentityCodeEnum.IDENTITY_CODE_PERSONAL:
                identity.personalExtend = IdentityPersonalExtend.create(template.extend)
                break
            default:
                throw new Error(`Not supported identity code=${template.code}`)
        }
    }

    // 签名身份
    await signIdentity(blockAddress.privateKey, identity)

    // 验证公私钥是否匹配
    const isValid = await verifyIdentity(identity)
    if (!isValid) {
        throw new Error("Invalid blockAddress!")
    }

    return identity
}

export async function signIdentity(privateKey: string, identity: Identity) {
    identity.signature = ""
    const signature = await signData(privateKey, Identity.encode(identity).finish())
    identity.signature = signature
}

export async function verifyIdentity(identity: Identity) {
    const signature = identity.signature
    try {
        identity.signature = ""
        const publicKey = fromDidToPublicKey((identity.metadata as IdentityMetadata).did)
        return await verifyData(publicKey, Identity.encode(identity).finish(), signature)
    } finally {
        identity.signature = signature
    }
}

export async function verifyData(publicKey: string, data: Uint8Array, signature: string) {
    return await verifyHashBytes(publicKey, new Digest().update(data).sum(), signature)
}

export async function signData(privateKey: string, data: Uint8Array) {
    return signHashBytes(privateKey, new Digest().update(data).sum())
}

function buildBlockAddress(networkType: NetworkTypeEnum, wallet: HDNodeWallet, path: string): BlockAddress {
    const blockAddress = BlockAddress.create({
        privateKey: wallet.privateKey,
        address: computeAddress(wallet.privateKey),
        publicKey: wallet.publicKey,
        identifier: constructIdentifier(networkType, wallet.publicKey)
    })

    if (wallet.mnemonic !== null) {
        blockAddress.mnemonic = Mnemonic.create({
            path: path,
            password: wallet.mnemonic.password,
            phrase: wallet.mnemonic.phrase,
            locale: wallet.mnemonic.wordlist.locale
        })
    }

    return blockAddress
}
