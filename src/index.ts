export {
    createBlockAddress,
    createIdentity,
    recoveryFromMnemonic,
    signData,
    signIdentity,
    updateIdentity,
    verifyData,
    verifyIdentity
} from './wallet/identity'
export { fromDidToPublicKey } from './common/codec'
export { verifyHashBytes, signHashBytes } from './common/signature'
export { IdentityTemplate } from './wallet/model'
export * from './yeying/api/web3/web3'
