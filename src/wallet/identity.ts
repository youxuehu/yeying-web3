import { decodeBase64, encodeBase64, fromDidToPublicKey, trimLeft } from '../common/codec'
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
    SecurityAlgorithm,
    SecurityConfig
} from '../yeying/api/web3/web3'
import { constructIdentifier, IdentityTemplate } from './model'
import { getCurrentUtcString } from '../common/date'
import { Digest } from '../common/digest'
import { signHashBytes, verifyHashBytes } from '../common/signature'
import elliptic from 'elliptic'
import { convertToAlgorithmName, decrypt, digest, encrypt, generateIv, importKey } from '../common/crypto'

/**
 * 将身份（Identity）对象序列化为二进制数据。
 * 该函数使用 `Identity.encode` 方法将身份对象编码为二进制数据。
 * @param identity - 身份对象
 * @returns 返回序列化后的二进制数据（Uint8Array 格式）
 * @example
 * ```ts
 * const identity = {
 *   metadata: { did: 'example-did', name: 'Example Identity' },
 *   blockAddress: 'encrypted-block-address',
 *   signature: 'example-signature'
 * }
 * const binaryData = serializeIdentityToBinary(identity)
 * console.log(binaryData)
 * ```
 */
export function serializeIdentityToBinary(identity: Identity): Uint8Array {
    return Identity.encode(identity).finish()
}

/**
 * 从二进制数据中反序列化身份（Identity）对象。
 * 该函数使用 `Identity.decode` 方法将二进制数据解码为身份对象。
 * @param binary - 包含身份信息的二进制数据（Uint8Array 格式）
 * @returns 返回反序列化后的身份对象
 * @example
 * ```ts
 * const binaryData = new Uint8Array( 二进制数据 )
 * const identity = deserializeIdentityFromBinary(binaryData)
 * console.log(identity)
 * ```
 */
export function deserializeIdentityFromBinary(binary: Uint8Array): Identity {
    return Identity.decode(binary)
}

/**
 * 将身份（Identity）对象序列化为 JSON 字符串。
 * 该函数使用 `Identity.toJSON` 方法将身份对象转换为 JavaScript 对象，然后将其序列化为 JSON 字符串。
 * @param identity - 身份对象
 * @returns 返回序列化后的 JSON 字符串
 * @example
 * ```ts
 * const identity = {
 *   metadata: { did: 'example-did', name: 'Example Identity' },
 *   blockAddress: 'encrypted-block-address',
 *   signature: 'example-signature'
 * }
 * const identityJson = serializeIdentityToJson(identity)
 * console.log(identityJson)
 * ```
 */
export function serializeIdentityToJson(identity: Identity): string {
    return JSON.stringify(Identity.toJSON(identity))
}

/**
 * 从 JSON 字符串中反序列化身份（Identity）对象。
 * 该函数将 JSON 字符串解析为 JavaScript 对象，然后使用 `Identity.fromJSON` 方法将其转换为身份对象。
 * @param str - 包含身份信息的 JSON 字符串
 * @returns 返回反序列化后的身份对象
 * @example
 * ```ts
 * const identityJson = '{"metadata": {"did": "example-did", "name": "Example Identity"}, "blockAddress": "encrypted-block-address", "signature": "example-signature"}'
 * const identity = deserializeIdentityFromJson(identityJson)
 * console.log(identity)
 * ```
 */
export function deserializeIdentityFromJson(str: string): Identity {
    return Identity.fromJSON(JSON.parse(str))
}

/**
 * 从助记词恢复 BlockAddress。
 * 该函数使用助记词、密码和路径生成 HD 钱包，并构建对应的 BlockAddress。
 * @param mnemonic - 助记词对象，包含助记词短语、密码、路径和语言
 * @param networkType - 网络类型（如 NETWORK_TYPE_YEYING）
 * @returns 返回恢复的 BlockAddress 对象
 * @example
 * ```ts
 * const mnemonic = {
 *   phrase: 'abandon abandon abandon ...',
 *   password: 'myPassword',
 *   path: "m/44'/0'/0'/0/0",
 *   locale: 'en'
 * }
 * const networkType = NetworkTypeEnum.NETWORK_TYPE_YEYING
 * const blockAddress = recoveryFromMnemonic(mnemonic, networkType)
 * console.log(blockAddress)
 * ```
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
 * 从 BlockAddress 中派生出一个加密密钥。
 * 使用椭圆曲线密码学（Elliptic Curve Cryptography, ECC）的 `secp256k1` 曲线，
 * 通过私钥和公钥的椭圆曲线点乘操作生成派生密钥。
 * @param blockAddress - 包含私钥和公钥的 BlockAddress 对象
 * @returns 返回派生的密钥（Uint8Array）
 * @example
 * ```ts
 * const blockAddress = { privateKey: '0x...', publicKey: '0x...' }
 * const derivedKey = deriveFromBlockAddress(blockAddress)
 * ```
 */
export function deriveFromBlockAddress(blockAddress: BlockAddress): Uint8Array {
    const ec = new elliptic.ec('secp256k1')
    const priKeyEc = ec.keyFromPrivate(trimLeft(blockAddress.privateKey, '0x'), 'hex')
    const pubKeyEc = ec.keyFromPublic(trimLeft(blockAddress.publicKey, '0x'), 'hex')
    const deriveKey = priKeyEc.derive(pubKeyEc.getPublic())
    return new Uint8Array(deriveKey.toArray('be'))
}

/**
 * 创建一个新的 BlockAddress。
 * 该函数生成一个基于指定网络、语言和路径的 BlockAddress。
 * 如果提供了密码，将用于增强安全性。
 * @param network - 网络类型（默认为 NETWORK_TYPE_YEYING）
 * @param language - 语言代码（默认为 'LANGUAGE_CODE_ZH_CH'，即中文）
 * @param password - 可选的密码，用于增强安全性（默认为空字符串）
 * @param path - 可选的路径（默认为默认路径）
 * @returns 返回生成的 BlockAddress 对象
 * @example
 * ```ts
 * const blockAddress = createBlockAddress(NetworkTypeEnum.NETWORK_TYPE_YEYING, 'LANGUAGE_CODE_ZH_CH', 'myPassword')
 * console.log(blockAddress)
 * ```
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
 * 更新身份（Identity）信息。
 * 该函数根据提供的模板更新身份的元数据、扩展信息和注册信息，并重新签名。
 * 更新操作会验证身份的有效性，并确保公私钥匹配。
 * @param template - 包含更新信息的部分身份模板
 * @param identity - 原始身份对象
 * @param blockAddress - 包含私钥的 BlockAddress 对象，用于签名
 * @returns 返回更新后的身份对象
 * @example
 * ```ts
 * const template = {
 *   name: 'Updated Name',
 *   description: 'Updated description',
 *   extend: { 更新的扩展信息 }
 * }
 * const identity = { 原始对象信息 }
 * const blockAddress = { privateKey: 'example-private-key', 其他字段}
 * const updatedIdentity = await updateIdentity(template, identity, blockAddress)
 * console.log(updatedIdentity)
 * ```
 */
export async function updateIdentity(template: Partial<IdentityTemplate>, identity: Identity, password: string) {
    // 判断身份是否有效
    let isValid = await verifyIdentity(identity)
    if (!isValid) {
        throw new Error('Invalid identity!')
    }

    // 解密区块链地址
    const blockAddress = await decryptBlockAddress(
        identity.blockAddress,
        identity.securityConfig?.algorithm as SecurityAlgorithm,
        password
    )

    // 克隆身份
    const newIdentity: Identity = Identity.decode(Identity.encode(identity).finish())

    // 更新元信息
    const metadata = newIdentity.metadata as IdentityMetadata
    metadata.name = template.name ?? metadata.name
    metadata.description = template.description ?? metadata.description
    metadata.parent = template.parent ?? metadata.parent
    metadata.avatar = template.avatar ?? metadata.avatar
    metadata.version = metadata.version + 1
    metadata.updatedAt = getCurrentUtcString()

    // TODO: 更新安全信息，不能随意更新，这里需要策略
    // if (template.securityConfig) {
    //     newIdentity.securityConfig = SecurityConfig.create(template.securityConfig)
    // }

    // 更新扩展信息
    const extend = template.extend
    if (extend) {
        switch (metadata.code) {
            case IdentityCodeEnum.IDENTITY_CODE_PERSONAL:
                const personalExtend = extend as IdentityPersonalExtend
                newIdentity.personalExtend = IdentityPersonalExtend.create({
                    email: personalExtend.email ?? identity.personalExtend?.email,
                    telephone: personalExtend.telephone ?? identity.personalExtend?.telephone,
                    extend: personalExtend.extend ?? identity.personalExtend?.extend
                })

                break
            case IdentityCodeEnum.IDENTITY_CODE_ORGANIZATION:
                const organizationExtend = extend as IdentityOrganizationExtend
                newIdentity.organizationExtend = IdentityOrganizationExtend.create({
                    address: organizationExtend.address ?? identity.organizationExtend?.address,
                    code: organizationExtend.code ?? identity.organizationExtend?.code,
                    extend: organizationExtend.extend ?? identity.organizationExtend?.extend
                })

                break
            case IdentityCodeEnum.IDENTITY_CODE_SERVICE:
                const serviceExtend = extend as IdentityServiceExtend
                newIdentity.serviceExtend = IdentityServiceExtend.create({
                    code: serviceExtend.code ?? identity.serviceExtend?.code,
                    apiCodes: serviceExtend.apiCodes ?? identity.serviceExtend?.apiCodes,
                    proxy: serviceExtend.proxy ?? identity.serviceExtend?.proxy,
                    grpc: serviceExtend.grpc ?? identity.serviceExtend?.grpc,
                    extend: serviceExtend.extend ?? identity.serviceExtend?.extend
                })

                break
            case IdentityCodeEnum.IDENTITY_CODE_APPLICATION:
                const applicationExtend = extend as IdentityApplicationExtend
                newIdentity.applicationExtend = IdentityApplicationExtend.create({
                    code: applicationExtend.code ?? identity.applicationExtend?.code,
                    serviceCodes: applicationExtend.serviceCodes ?? identity.applicationExtend?.serviceCodes,
                    location: applicationExtend.location ?? identity.applicationExtend?.location,
                    hash: applicationExtend.hash ?? identity.applicationExtend?.hash,
                    extend: applicationExtend.extend ?? identity.applicationExtend?.extend
                })
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
 * 创建一个新的身份。
 * 该函数根据提供的 BlockAddress、加密的 BlockAddress 和身份模板生成一个身份对象。
 * 身份对象包含元数据、扩展信息和安全配置，并通过私钥签名验证。
 *
 * @param template 身份模板，包含身份的基本信息和扩展信息
 * @param password 身份的加密密码
 *
 * @returns 身份对象，区块链地址是加密状态
 *
 * @example
 * ```ts
 * const password = '<Your password for block address of identity>'
 * const template = {
 *   network: 'NETWORK_TYPE_YEYING',
 *   name: 'Example Identity',
 *   description: 'This is an example identity',
 *   code: IdentityCodeEnum.IDENTITY_CODE_PERSONAL,
 *   extend: { ' 扩展信息 ' }
 * }
 *
 * const identity = await createIdentity(template, password)
 *
 * console.log(identity)
 * ```
 */
export async function createIdentity(template: IdentityTemplate, password: string) {
    // 创建区块链地址
    const blockAddress = createBlockAddress()
    if (template.securityConfig === undefined) {
        // 如果没有定义安全配置，则创建一个空的安全配置
        template.securityConfig = {
            algorithm: generateSecurityAlgorithm()
        }
    }

    // 使用密码和安全算法加密区块链地址
    const encryptedBlockAddress = await encryptBlockAddress(
        blockAddress,
        template.securityConfig.algorithm as SecurityAlgorithm,
        password
    )

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
        createdAt: getCurrentUtcString(),
        updatedAt: getCurrentUtcString()
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
                identity.applicationExtend = IdentityApplicationExtend.create(template.extend ?? {})
                break
            case IdentityCodeEnum.IDENTITY_CODE_SERVICE:
                identity.serviceExtend = IdentityServiceExtend.create(template.extend ?? {})
                break
            case IdentityCodeEnum.IDENTITY_CODE_ORGANIZATION:
                identity.organizationExtend = IdentityOrganizationExtend.create(template.extend ?? {})
                break
            case IdentityCodeEnum.IDENTITY_CODE_PERSONAL:
                identity.personalExtend = IdentityPersonalExtend.create(template.extend ?? {})
                break
            default:
                throw new Error(`Not supported identity code=${template.code}`)
        }
    }

    // 签名身份
    await signIdentity(blockAddress.privateKey, identity)
    return identity
}

/**
 * 使用私钥对身份对象进行签名。
 * 该函数首先清空身份对象的签名字段，然后对身份对象进行序列化并签名。
 * 签名完成后，将签名值写回到身份对象的签名字段中。
 * @param privateKey - 用于签名的私钥
 * @param identity - 身份对象
 * @returns 返回签名后的身份对象
 * @example
 * ```ts
 * const privateKey = 'example-private-key'
 * const identity = {
 *   metadata: { did: 'example-did', name: 'Example Identity' },
 *   blockAddress: 'encrypted-block-address',
 *   signature: ''
 * }
 * await signIdentity(privateKey, identity)
 * console.log(identity.signature) // 签名后的值
 * ```
 */
export async function signIdentity(privateKey: string, identity: Identity) {
    identity.signature = ''
    const signature = await signData(privateKey, Identity.encode(identity).finish())
    identity.signature = signature
}

/**
 * 验证身份（Identity）对象的签名是否有效。
 * 该函数通过以下步骤验证身份：
 * 1. 从身份的 DID 中提取公钥。
 * 2. 清空身份对象的签名字段，然后对身份对象进行序列化。
 * 3. 使用公钥验证序列化后的身份对象的签名。
 * @param identity - 身份对象
 * @returns 如果签名有效，返回 true；否则返回 false
 * @example
 * ```ts
 * const identity = {
 *   metadata: { did: 'example-did', name: 'Example Identity' },
 *   blockAddress: 'encrypted-block-address',
 *   signature: 'example-signature'
 * }
 * const isValid = await verifyIdentity(identity)
 * console.log(isValid) // 输出：true 或 false
 * ```
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
 * 验证数据的签名是否有效。
 * 该函数首先计算数据的哈希值，然后使用公钥验证签名。
 * @param publicKey - 用于验证的公钥
 * @param data - 需要验证的数据（Uint8Array 格式）
 * @param signature - 数据的签名
 * @returns 如果签名有效，返回 true；否则返回 false
 * @example
 * ```ts
 * const publicKey = 'example-public-key'
 * const data = new Uint8Array([1, 2, 3])
 * const signature = 'example-signature'
 * const isValid = await verifyData(publicKey, data, signature)
 * console.log(isValid) // 输出：true 或 false
 * ```
 */
export async function verifyData(publicKey: string, data: Uint8Array, signature: string) {
    return await verifyHashBytes(publicKey, new Digest().update(data).sum(), signature)
}

/**
 * 使用私钥对数据进行签名。
 * 该函数首先计算数据的哈希值，然后使用私钥对哈希值进行签名。
 *
 * @param privateKey  用于签名的私钥
 * @param data 需要签名的数据（Uint8Array 格式）
 *
 * @returns 返回签名后的数据
 * @example
 * ```ts
 * const privateKey = 'example-private-key'
 * const data = new Uint8Array([1, 2, 3])
 * const signature = await signData(privateKey, data)
 * console.log(signature)
 * ```
 */
export async function signData(privateKey: string, data: Uint8Array) {
    return signHashBytes(privateKey, new Digest().update(data).sum())
}

/**
 * 加密区块链地址
 *
 * @param blockAddress 区块链地址结构体
 * @param securityAlgorithm 加密算法
 * @param password 密钥
 *
 * @returns 返回加密后的字符串，使用base64编码
 */
export async function encryptBlockAddress(
    blockAddress: BlockAddress,
    securityAlgorithm: SecurityAlgorithm,
    password: string
) {
    const algorithmName = convertToAlgorithmName(securityAlgorithm.name)
    const hashBytes = await digest(new TextEncoder().encode(password), 'SHA-256')
    const cryptoKey = await importKey(hashBytes, algorithmName)
    const cipher = await encrypt(
        cryptoKey,
        BlockAddress.encode(blockAddress).finish(),
        decodeBase64(securityAlgorithm.iv),
        algorithmName
    )
    return encodeBase64(cipher)
}

export function generateSecurityAlgorithm(algorithmName: string = 'AES-GCM') {
    return SecurityAlgorithm.create({ name: algorithmName, iv: encodeBase64(generateIv(12)) })
}

/**
 * 解密区块链地址
 *
 * @param blockAddress 加密后的区块链地址，使用base64编码
 * @param securityAlgorithm 解密算法
 * @param password 密钥
 *
 * @returns 返回区块链地址结构
 */
export async function decryptBlockAddress(
    blockAddress: string,
    securityAlgorithm: SecurityAlgorithm,
    password: string
) {
    const algorithmName = convertToAlgorithmName(securityAlgorithm.name)
    const hashBytes = await digest(new TextEncoder().encode(password), 'SHA-256')
    const cryptoKey = await importKey(hashBytes, algorithmName)
    const plain = await decrypt(
        cryptoKey,
        decodeBase64(blockAddress),
        decodeBase64(securityAlgorithm.iv),
        algorithmName
    )
    return BlockAddress.decode(new Uint8Array(plain))
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
