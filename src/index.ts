import {
    createBlockAddress,
    createIdentity,
    recoveryFromMnemonic,
    signData,
    signHashBytes,
    signIdentity,
    updateIdentity,
    verifyData,
    verifyHashBytes,
    verifyIdentity
} from './wallet/identity'
import { fromDidToPublicKey } from './common/codec'

export { IdentityTemplate } from './wallet/model'
export * from '../yeying/api/web3/web3_pb'

export {
    createBlockAddress,
    recoveryFromMnemonic,
    signHashBytes,
    verifyHashBytes,
    signData,
    verifyData,
    createIdentity,
    updateIdentity,
    signIdentity,
    verifyIdentity,
    fromDidToPublicKey
}
