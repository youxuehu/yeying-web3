import {
    createBlockAddress,
    createIdentity,
    decryptBlockAddress,
    encryptBlockAddress,
    recoveryFromMnemonic,
    signData,
    signIdentity,
    updateIdentity,
    verifyData,
    verifyIdentity
} from "./wallet/identity"
import {
    computeHash,
    decodeBase64,
    decrypt,
    deriveRawKeyFromPassword,
    encodeBase64,
    encrypt,
    generateIv,
    isBrowser,
    isNode
} from "./common/crypto"

export { Identity, IdentityTemplate } from "./wallet/model"
export {
    CipherTypeEnum,
    IdentityCodeEnum,
    NetworkTypeEnum
} from "./yeying/api/common/code"
export {
    SecurityAlgorithm,
    SecurityConfig,
    IdentityMetadata,
    BlockAddress,
    IdentityOrganizationExtend,
    IdentityPersonalExtend,
    IdentityServiceExtend,
    IdentityApplicationExtend
} from "./yeying/api/common/message"

export const Crypto = {
    isNode,
    isBrowser,
    computeHash,
    generateIv,
    encodeBase64,
    decodeBase64,
    encrypt,
    decrypt,
    deriveRawKeyFromPassword
}

export const Wallet = {
    createBlockAddress,
    recoveryFromMnemonic,
    createIdentity,
    updateIdentity,
    signIdentity,
    verifyIdentity,
    signData,
    verifyData,
    decryptBlockAddress,
    encryptBlockAddress
}
