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
    computeHash, convertCipherTypeTo,
    decodeBase64,
    decrypt,
    deriveRawKeyFromString,
    encodeBase64,
    encrypt,
    generateIv,
    isBrowser,
    isNode, decodeString, encodeString, fromDidToPublicKey
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
    encodeString,
    decodeString,
    fromDidToPublicKey,
    encrypt,
    decrypt,
    deriveRawKeyFromString,
    convertCipherTypeTo,
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
