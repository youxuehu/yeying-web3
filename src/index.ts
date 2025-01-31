export {
    deriveFromBlockAddress,
    createBlockAddress,
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
export { fromDidToPublicKey } from './common/codec'
export { verifyHashBytes, signHashBytes } from './common/signature'
export { IdentityTemplate } from './wallet/model'
export * from './yeying/api/web3/web3'
export { Digest } from './common/digest'
