import { fromDidToPublicKey, trimLeft } from '../common/codec'
import { computeAddress, defaultPath, HDNodeWallet, Wordlist, wordlists } from 'ethers'
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
} from '../yeying/api/web3/web3'
import { constructIdentifier, IdentityTemplate } from './model'
import { getCurrentUtcString } from '../common/date'
import { Digest } from '../common/digest'
import { signHashBytes, verifyHashBytes } from '../common/signature'
import elliptic from 'elliptic'

export function serializeIdentityToBinary(identity: Identity): Uint8Array {
    return Identity.encode(identity).finish()
}

export function deserializeIdentityFromBinary(binary: Uint8Array): Identity {
    return Identity.decode(binary)
}

export function serializeIdentityToJson(identity: Identity): string {
    return JSON.stringify(Identity.toJSON(identity))
}

export function deserializeIdentityFromJson(str: string): Identity {
    return Identity.fromJSON(JSON.parse(str))
}

/**
 * 从助记词恢复区块地址。
 *
 * 该函数使用给定的助记词（`mnemonic`）来恢复钱包，并基于恢复的的钱包信息创建一个区块地址。
 *
 * @param mnemonic - 包含助记词、密码、路径和语言信息的对象。
 * @param networkType - 网络类型枚举，指定要创建的区块地址对应的网络。
 * @returns 返回恢复的区块地址（`BlockAddress` 类型）。
 *
 * @example
 * const mnemonic: Mnemonic = {
 *     phrase: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon",
 *     password: "your_password",
 *     path: "m/44'/60'/0'/0",
 *     locale: "en"
 * };
 * const networkType: NetworkTypeEnum = NetworkTypeEnum.NETWORK_TYPE_YEYING;
 * const blockAddress = recoveryFromMnemonic(mnemonic, networkType);
 * console.log(blockAddress);
 */
export function recoveryFromMnemonic(mnemonic: Mnemonic, networkType: NetworkTypeEnum) {
    const wallet = HDNodeWallet.fromPhrase(
        mnemonic.phrase,
        mnemonic.password,
        mnemonic.path,
        wordlists[mnemonic.locale]
    )
    return buildBlockAddress(networkType, wallet, mnemonic.path)
}

/**
 * 从区块链地址派生密钥对。
 *
 * 该函数使用 elliptic 库中的 `secp256k1` 曲线，基于提供的区块链地址（包括私钥和公钥）生成一个派生密钥。
 *
 * @param blockAddress - 包含私钥和公钥的区块链地址对象
 * @returns 返回派生的密钥（`Uint8Array` 类型）
 *
 * @example
 * const blockAddress = { privateKey: "0x1234...", publicKey: "0x5678..." };
 * const derivedKey = deriveFromBlockAddress(blockAddress);
 * console.log(derivedKey); // 打印派生后的密钥
 */
export function deriveFromBlockAddress(blockAddress: BlockAddress): Uint8Array {
    const ec = new elliptic.ec('secp256k1')
    const priKeyEc = ec.keyFromPrivate(trimLeft(blockAddress.privateKey, '0x'), 'hex')
    const pubKeyEc = ec.keyFromPublic(trimLeft(blockAddress.publicKey, '0x'), 'hex')
    const deriveKey = priKeyEc.derive(pubKeyEc.getPublic())
    return new Uint8Array(deriveKey.toArray('be'))
}

/**
 * 创建一个区块链地址。
 *
 * 该函数生成一个新的区块链地址，支持选择不同的语言和网络类型。通过密码和路径生成一个随机的 HD 钱包，并构建一个 BlockAddress 对象。
 *
 * @param network - 网络类型，默认为 `NetworkTypeEnum.NETWORK_TYPE_YEYING`。
 * @param language - 语言代码，默认为 `"LANGUAGE_CODE_ZH_CH"`，支持中文（简体）和英文（美国）。
 * @param password - 钱包密码，默认为空字符串（不加密）。
 * @param path - 钱包生成路径，默认为 `defaultPath`。
 * @returns 返回生成的区块链地址（`BlockAddress` 类型）。
 *
 * @example
 * const blockAddress = createBlockAddress(NetworkTypeEnum.NETWORK_TYPE_YEYING, "LANGUAGE_CODE_EN_US", "password123", "m/44'/60'/0'/0/0");
 * console.log(blockAddress);
 */
export function createBlockAddress(
    network: NetworkTypeEnum = NetworkTypeEnum.NETWORK_TYPE_YEYING,
    language: string = 'LANGUAGE_CODE_ZH_CH',
    password: string = '',
    path: string = defaultPath
): BlockAddress {
    let wordlist: Wordlist
    // 根据语言代码选择对应的词汇表
    switch (language) {
        case 'LANGUAGE_CODE_ZH_CH':
            wordlist = wordlists['zh_cn']
            break // 加上 break，避免漏掉其他语言的情况
        case 'LANGUAGE_CODE_EN_US':
            wordlist = wordlists['en']
            break
        default:
            wordlist = wordlists['zh_cn'] // 默认中文
            break
    }

    // 使用 HDNodeWallet 创建一个随机的钱包
    const wallet = HDNodeWallet.createRandom(password, path, wordlist)

    // 构建并返回 BlockAddress 对象
    return buildBlockAddress(network, wallet, path)
}

/**
 * 更新身份信息。
 *
 * 该函数首先验证传入的身份是否有效。如果身份有效，则克隆身份对象并更新其中的元信息、安全信息、扩展信息和注册信息。
 * 最后，更新身份的签名，并验证身份信息的公私钥匹配性。
 *
 * @param template - 包含身份更新内容的模板，类型为 `IdentityTemplate`。
 * @param identity - 需要更新的原身份对象，类型为 `Identity`。
 * @param blockAddress - 用于身份签名的区块地址，包含私钥等信息，类型为 `BlockAddress`。
 *
 * @returns 返回更新后的身份对象，类型为 `Identity`。
 *
 * @throws {Error} 如果身份无效或验证失败，将抛出错误。
 */
export async function updateIdentity(template: IdentityTemplate, identity: Identity, blockAddress: BlockAddress) {
    // 判断身份是否有效
    let isValid = await verifyIdentity(identity)
    if (!isValid) {
        throw new Error('Invalid identity!')
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
        throw new Error('Invalid blockAddress!')
    }

    return newIdentity
}

/**
 * 创建一个身份对象。
 *
 * 该函数基于提供的区块地址、加密的区块地址以及身份模板，生成一个完整的身份对象。身份对象包括元数据、扩展信息、签名以及验证步骤。
 *
 * @param blockAddress - 区块地址对象，包含身份的基本信息（如 DID、地址等）。
 * @param encryptedBlockAddress - 加密的区块地址，用于存储和传输。
 * @param template - 身份模板，包含身份的详细配置，如网络类型、名称、描述、父级身份、扩展信息等。
 * @returns 返回创建的身份对象（`Identity` 类型）。
 *
 * @throws {Error} 如果验证失败，则抛出错误 "Invalid blockAddress!"。
 *
 * @example
 * const blockAddress: BlockAddress = {
 *     identifier: "did:example:12345",
 *     address: "0xabcdef...",
 *     privateKey: "0xprivatekey..."
 * };
 * const encryptedBlockAddress: string = "encryptedAddressString";
 */
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
        throw new Error('Invalid blockAddress!')
    }

    return identity
}

/**
 * 使用私钥对身份信息进行签名。
 *
 * 该函数首先对身份信息进行编码，然后使用传入的私钥对其进行签名，并将签名存储在身份对象中。
 *
 * @param privateKey - 用于签名的私钥（字符串格式）。
 * @param identity - 需要签名的身份信息对象（`Identity` 类型）。
 *
 * @example
 * const privateKey = "your_private_key";
 * const identity = new Identity();
 * await signIdentity(privateKey, identity);
 * console.log(identity.signature);  // 输出签名
 */
export async function signIdentity(privateKey: string, identity: Identity) {
    identity.signature = ''
    const signature = await signData(privateKey, Identity.encode(identity).finish())
    identity.signature = signature
}

/**
 * 验证身份的签名。
 *
 * 该函数检查身份对象的签名是否有效。它提取身份的签名，使用与身份关联的公钥和数据进行验证。
 * 如果签名有效，返回 `true`，否则返回 `false`。
 *
 * @param identity - 需要验证签名的身份对象，类型为 `Identity`。
 *
 * @returns 返回一个布尔值，表示身份签名是否有效。如果签名有效，返回 `true`，否则返回 `false`。
 *
 * @throws {Error} 如果验证过程中出现任何错误，将抛出异常。
 *
 */
export async function verifyIdentity(identity: Identity) {
    const signature = identity.signature
    try {
        identity.signature = ''
        const publicKey = fromDidToPublicKey((identity.metadata as IdentityMetadata).did)
        return await verifyData(publicKey, Identity.encode(identity).finish(), signature)
    } finally {
        identity.signature = signature
    }
}

/**
 * 验证数据的签名。
 *
 * 该函数使用公钥和签名验证数据是否未被篡改。它通过哈希计算传入的数据，并与提供的签名进行匹配。
 *
 * @param publicKey - 用于验证签名的公钥，类型为 `string`。
 * @param data - 需要验证的数据，类型为 `Uint8Array`。
 * @param signature - 数据的签名，类型为 `string`。
 *
 * @returns 返回一个布尔值，表示签名是否有效。如果签名有效，返回 `true`，否则返回 `false`。
 *
 * @throws {Error} 如果验证过程失败，将抛出错误。
 *
 * @example
 * const publicKey = "yourPublicKeyHere";
 * const data = new TextEncoder().encode("data to verify");
 * const signature = "signatureOfData";
 * const isValid = await verifyData(publicKey, data, signature);
 * console.log(isValid);  // 输出验证结果：true 或 false
 */
export async function verifyData(publicKey: string, data: Uint8Array, signature: string) {
    return await verifyHashBytes(publicKey, new Digest().update(data).sum(), signature)
}

/**
 * 使用私钥对数据进行签名。
 *
 * 该函数将传入的数据进行哈希处理，并使用指定的私钥对数据的哈希值进行签名。
 *
 * @param privateKey - 用于签名的数据私钥（字符串格式）。
 * @param data - 需要签名的原始数据（`Uint8Array` 类型）。
 * @returns 返回签名后的数据（`Uint8Array` 类型）。
 *
 * @example
 * const privateKey = "your_private_key";
 * const data = new Uint8Array([1, 2, 3, 4, 5]);
 * const signedData = await signData(privateKey, data);
 * console.log(signedData);
 */
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
