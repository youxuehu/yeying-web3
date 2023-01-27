import {Identity} from './account/Identity'
import {Blockchain} from './contract/Blockchain';

export {NetworkType} from './model/Constant';
export {Configuration} from './account/Configuration'
export {BlockAddress} from './model/BlockAddress'

// https://rollupjs.org/guide/en/#outputexports
export const Account = Identity
export const Chain = Blockchain