export {
    deriveFromBlockAddress,
    createBlockAddress,
    encryptBlockAddress,
    decryptBlockAddress,
    createIdentity,
    recoveryFromMnemonic,
    signData,
    signIdentity,
    updateIdentity,
    verifyData,
    verifyIdentity,
    deserializeIdentityFromJson,
    serializeIdentityToJson,
    deserializeIdentityFromBinary,
    serializeIdentityToBinary
} from './wallet/identity'

export {
    fromDidToPublicKey,
    encodeString,
    encodeBase64,
    decodeString,
    decodeBase64,
    encodeHex,
    decodeHex
} from './common/codec'
export { verifyHashBytes, signHashBytes } from './common/signature'
export { IdentityTemplate } from './wallet/model'
export { Digest } from './common/digest'
export { generateKey, generateIv, exportKey, importKey, digest, encrypt, decrypt } from './common/crypto'

export {
    IdentityCodeEnum,
    IdentityServiceExtend,
    IdentityOrganizationExtend,
    IdentityPersonalExtend,
    IdentityApplicationExtend,
    NetworkTypeEnum,
    Registry,
    SecurityConfig,
    BlockAddress,
    Identity,
    Mnemonic,
    IdentityMetadata,
    SecurityAlgorithm
} from './yeying/api/web3/web3'

export * from './common/error'
export * from "./common/date"

export * from './shared/types/common';
export * from './shared/types/crypto';
export * from './shared/types/pairing';
export * from './shared/types/relay';
export * from './shared/types/session';

export * from './shared/client/dapp';
export * from './shared/client/wallet';

export * from './shared/utils/pairing-uri';

export * from './wallet/auth'