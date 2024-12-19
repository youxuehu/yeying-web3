import {
    createBlockAddress,
    createIdentity,
    decryptBlockAddress, encryptBlockAddress,
    recoveryFromMnemonic, signData, signIdentity,
    updateIdentity, verifyData, verifyIdentity
} from "./wallet/identity";

export {Identity, IdentityTemplate} from "./wallet/model";

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
    encryptBlockAddress,
}