import { toBeHex } from 'ethers'
import {
    IdentityApplicationExtend,
    IdentityCodeEnum,
    IdentityOrganizationExtend,
    IdentityPersonalExtend,
    IdentityServiceExtend,
    NetworkTypeEnum, Registry,
    SecurityConfig
} from "../yeying/api/web3/web3"

/**
 * 身份模板类，用于描述一个身份的基本信息和扩展信息。
 * 
 * 该类用于构建身份的模板，包含了身份的核心属性、可选的扩展信息及安全配置等。
 * 
 * @class
 */
export class IdentityTemplate {
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
    
    /** 身份的头像（URL）。 */
    avatar: string
    
    /** 可选的安全配置，包含身份的安全设置。 */
    securityConfig?: SecurityConfig
    
    /** 可选的扩展信息，根据身份类型不同，使用不同的扩展类。 */
    extend?: IdentityServiceExtend | IdentityOrganizationExtend | IdentityPersonalExtend | IdentityApplicationExtend
    
    /** 可选的注册信息，包含身份的注册数据。 */
    registry?: Registry;

    /**
     * 创建一个新的身份模板。
     * 
     * @param language - 身份的语言代码。
     * @param network - 身份所属的网络类型。
     * @param parent - 父级身份的标识符。
     * @param code - 身份的类型代码。
     * @param name - 身份的名称。
     * @param description - 身份的描述信息。
     * @param avatar - 身份的头像（URL）。
     * @param securityConfig - 可选的身份安全配置。
     * @param extend - 可选的扩展信息，根据身份类型的不同而不同。
     * @param registry - 可选的注册信息，包含身份的注册数据。
     */
    constructor(
        language: string,
        network: NetworkTypeEnum,
        parent: string,
        code: IdentityCodeEnum,
        name: string,
        description: string,
        avatar: string,
        securityConfig?: SecurityConfig,
        extend?: IdentityServiceExtend | IdentityOrganizationExtend | IdentityPersonalExtend | IdentityApplicationExtend,
        registry?: Registry,
    ) {
        this.language = language
        this.network = network
        this.parent = parent
        this.code = code
        this.name = name
        this.description = description
        this.avatar = avatar
        this.securityConfig = securityConfig
        this.extend = extend
        this.registry = registry
    }
}


export function constructIdentifier(network: NetworkTypeEnum, publicKey: string): string {
    return `did:ethr:${toBeHex(network)}:${publicKey}`
}
