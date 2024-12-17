import {
    createBlockAddress,
    createIdentity,
    decryptBlockAddress, encryptBlockAddress,
    recoveryFromMnemonic, signIdentity,
    updateIdentity, verifyIdentity
} from "./wallet/identity";

export const Identity = {
    createBlockAddress,
    recoveryFromMnemonic,
    createIdentity,
    updateIdentity,
    signIdentity,
    verifyIdentity,
    decryptBlockAddress,
    encryptBlockAddress,
}