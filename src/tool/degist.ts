import { hash } from '@stablelib/sha256'
import * as u8a from 'uint8arrays'

export function sha256(payload: string | Uint8Array): Uint8Array {
    const data = typeof payload === 'string' ? u8a.fromString(payload) : payload
    return hash(data)
}