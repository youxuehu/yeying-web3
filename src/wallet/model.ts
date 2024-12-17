import {
    IdentityApplicationExtend,
    IdentityMetadata,
    IdentityOrganizationExtend,
    IdentityPersonalExtend,
    IdentityServiceExtend
} from "../yeying/api/common/message";
import {ApplicationCodeEnum, IdentityCodeEnum, NetworkTypeEnum} from "../yeying/api/common/code";
import {toBeHex} from "ethers";
import crypto from "crypto";

export function getCurrentUtcString() {
    const now = new Date();
    return now.toISOString();
}



export function encodeBase64(bytes: ArrayBufferLike) {
    return Buffer.from(bytes).toString("base64")
}

export function decodeBase64(str: string) {
    return Buffer.from(str, "base64")
}

export interface Identity {
    metadata: IdentityMetadata
    blockAddress: string
    extend: IdentityServiceExtend | IdentityOrganizationExtend | IdentityPersonalExtend | IdentityApplicationExtend,
    signature: string
}

export interface IdentityTemplate {
    parent: string
    code: IdentityCodeEnum
    name: string
    description: string
    avatar: string
    extend: IdentityServiceExtend | IdentityOrganizationExtend | IdentityPersonalExtend | IdentityApplicationExtend
}

export function convertApplicationCodeFrom(code: string) {
    const v = ApplicationCodeEnum[code as keyof typeof ApplicationCodeEnum];
    return v !== undefined ? v : ApplicationCodeEnum.APPLICATION_CODE_UNKNOWN
}

export function convertApplicationCodeEnumTo(code: ApplicationCodeEnum) {
    return ApplicationCodeEnum[code] || ApplicationCodeEnum[ApplicationCodeEnum.APPLICATION_CODE_UNKNOWN]
}

export function constructIdentifier(network: NetworkTypeEnum, publicKey: string): string {
    return `did:ethr:${toBeHex(network)}:${publicKey}`;
}