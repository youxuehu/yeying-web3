import { toBeHex } from 'ethers'
import {
    IdentityApplicationExtend,
    IdentityCodeEnum,
    IdentityOrganizationExtend,
    IdentityPersonalExtend,
    IdentityServiceExtend,
    NetworkTypeEnum,
    SecurityConfig
} from '../../yeying/api/web3/web3_pb'

export class IdentityTemplate {
    language: string
    network: NetworkTypeEnum
    parent: string
    code: IdentityCodeEnum
    name: string
    description: string
    avatar: string
    securityConfig: SecurityConfig
    extend: IdentityServiceExtend | IdentityOrganizationExtend | IdentityPersonalExtend | IdentityApplicationExtend

    constructor(
        language: string,
        network: NetworkTypeEnum,
        parent: string,
        code: IdentityCodeEnum,
        name: string,
        description: string,
        avatar: string,
        securityConfig: SecurityConfig,
        extend: IdentityServiceExtend | IdentityOrganizationExtend | IdentityPersonalExtend | IdentityApplicationExtend
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
    }
}

export function constructIdentifier(network: number, publicKey: string): string {
    return `did:ethr:${toBeHex(network)}:${publicKey}`
}
