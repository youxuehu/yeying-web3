import {Provider} from '@ethersproject/providers'
import {Contract} from '@ethersproject/contracts'
import {Signer} from 'ethers'

export interface Configuration {
    identifier: string
    owner?: string
    provider: Provider
    signer: Signer
    contract: Contract
}