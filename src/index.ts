import {
    createBlockAddress,
    createIdentity,
    decryptBlockAddress, encryptBlockAddress,
    recoveryFromMnemonic, signIdentity,
    updateIdentity, verifyIdentity
} from "./wallet/identity";

export {Identity, IdentityTemplate} from "./wallet/model";

export const Wallet = {
    createBlockAddress,
    recoveryFromMnemonic,
    createIdentity,
    updateIdentity,
    signIdentity,
    verifyIdentity,
    decryptBlockAddress,
    encryptBlockAddress,
}