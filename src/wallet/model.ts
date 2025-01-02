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

export class IdentityTemplate {
    language: string
    network: NetworkTypeEnum
    parent: string
    code: IdentityCodeEnum
    name: string
    description: string
    avatar: string
    securityConfig?: SecurityConfig
    extend?: IdentityServiceExtend | IdentityOrganizationExtend | IdentityPersonalExtend | IdentityApplicationExtend
    registry?: Registry;
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
