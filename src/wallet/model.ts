export enum NetworkType {
    YeYing = 2020
}
export enum Language {
    EN_US = 'en-US',
    ZH_CN = 'zh-CN',
}

export interface BlockAddress {
    identifier: string
    mnemonic?: Mnemonic
    address: string
    privateKey: string
    publicKey: string
}

export interface Mnemonic {
    readonly phrase: string
    readonly path: string
    readonly locale: string
    readonly password: string
}

export interface IdentityAddress {
    identifier: string
    address: string
    publicKey: string
    networkType: NetworkType
}