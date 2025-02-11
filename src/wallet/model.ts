import { toBeHex } from 'ethers'
import {
    IdentityApplicationExtend,
    IdentityCodeEnum,
    IdentityOrganizationExtend,
    IdentityPersonalExtend,
    IdentityServiceExtend,
    NetworkTypeEnum,
    Registry,
    SecurityConfig
} from '../yeying/api/web3/web3'

/**
 * 身份模板类，用于描述一个身份的基本信息和扩展信息。
 *
 * 该类用于构建身份的模板，包含了身份的核心属性、可选的扩展信息及安全配置等。
 *
 * @class
 */
export interface IdentityTemplate {
    /** 语言代码，表示身份的语言类型。 */
    language: string

    /** 网络类型，表示身份所属的网络。 */
    network: NetworkTypeEnum

    /** 父级身份的标识符。 */
    parent: string

    /** 身份的类型代码。 */
    code: IdentityCodeEnum

    /** 身份的名称。 */
    name: string

    /** 身份的描述信息。 */
    description: string

    /** 身份的头像（base64|URL）。 */
    avatar: string

    /** 可选的安全配置，包含身份的安全设置。 */
    securityConfig?: SecurityConfig

    /** 可选的扩展信息，根据身份类型不同，使用不同的扩展类。 */
    extend?:
        | Partial<IdentityServiceExtend>
        | Partial<IdentityOrganizationExtend>
        | Partial<IdentityPersonalExtend>
        | Partial<IdentityApplicationExtend>

    /** 可选的身份注册地。 */
    registry?: Registry
}

export function constructIdentifier(network: NetworkTypeEnum, publicKey: string): string {
    return `did:ethr:${toBeHex(network)}:${publicKey}`
}
