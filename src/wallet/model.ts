import {
    IdentityApplicationExtend,
    IdentityMetadata,
    IdentityOrganizationExtend,
    IdentityPersonalExtend,
    IdentityServiceExtend
} from "../yeying/api/common/message";
import {IdentityCodeEnum, NetworkTypeEnum} from "../yeying/api/common/code";
import {toBeHex} from "ethers";


export interface Identity {
    metadata: IdentityMetadata
    blockAddress: string
    extend: IdentityServiceExtend | IdentityOrganizationExtend | IdentityPersonalExtend | IdentityApplicationExtend,
    signature: string
}

export interface IdentityTemplate {
    network: NetworkTypeEnum
    parent: string
    code: IdentityCodeEnum
    name: string
    description: string
    avatar: string
    extend: IdentityServiceExtend | IdentityOrganizationExtend | IdentityPersonalExtend | IdentityApplicationExtend
}

export function constructIdentifier(network: NetworkTypeEnum, publicKey: string): string {
    return `did:ethr:${toBeHex(network)}:${publicKey}`;
}