import * as u8a from 'uint8arrays'
import {hexlify, hexValue, isBytes} from '@ethersproject/bytes';
import {NetworkType} from '../model/Constant';
import {Exception} from './Exception';
import * as base64 from '@ethersproject/base64'
import {Base58} from '@ethersproject/basex'
import {toUtf8Bytes} from '@ethersproject/strings'
import {IdentityAddress} from '../model/BlockAddress';
import {computeAddress} from '@ethersproject/transactions';

export function leftPad(data: string, size = 64): string {
    if (data.length === size) return data
    return '0'.repeat(size - data.length) + data
}

export function hexToBytes(s: string): Uint8Array {
    const input = s.startsWith('0x') ? s.substring(2) : s
    return u8a.fromString(input.toLowerCase(), 'base16')
}

export function bytesToHex(b: Uint8Array): string {
    return u8a.toString(b, 'base16')
}

export function base64ToBytes(s: string): Uint8Array {
    const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    return u8a.fromString(inputBase64Url, 'base64url')
}

export function constructIdentifier(network: NetworkType, publicKey: string): string {
    return `did:ethr:${hexValue(network)}:${publicKey}`;
}

export const identifierMatcher = /^(.*)?(0x[0-9a-fA-F]{40}|0x[0-9a-fA-F]{66})$/

export function parseIdentifier(identifier: string): IdentityAddress {
    const components = identifier.split(':')
    const publicKey = components[components.length - 1]
    const network = components.splice(2, components.length - 3).join(':')
    const networkType = parseInt(network, 16);
    if (!Object.keys(NetworkType).includes(NetworkType[networkType])) {
        throw new Error(Exception.UnknownNetwork);
    }

    return {
        identifier: identifier,
        publicKey: publicKey,
        networkType: networkType,
        address: computeAddress(publicKey),
    }
}

export function stringToBytes32(str: string): string {
    const buffStr = '0x' + Buffer.from(str).subarray(0, 32).toString('hex')
    return buffStr + '0'.repeat(66 - buffStr.length)
}

export function bytes32toString(input: string | Uint8Array): string {
    const buff: Buffer = typeof input === 'string' ? Buffer.from(input.slice(2), 'hex') : Buffer.from(input)
    return buff.toString('utf8').replace(/\0+$/, '')
}

export function strip0x(input: string): string {
    return input.startsWith('0x') ? input.slice(2) : input
}

export function kvToHex(key: string, value: string | Uint8Array): string {
    if (value instanceof Uint8Array || isBytes(value)) {
        return hexlify(value)
    }

    const matchKeyWithEncoding = key.match(/^did\/(pub|auth|svc)\/(\w+)(\/(\w+))?(\/(\w+))?$/)
    const matchHexString = (<string>value).match(/^0x[0-9a-fA-F]*$/)
    if (matchHexString) {
        return <string>value
    }

    const encoding = matchKeyWithEncoding?.[6]
    if (encoding) {
        if (encoding === 'base64') {
            return hexlify(base64.decode(value))
        }
        if (encoding === 'base58') {
            return hexlify(Base58.decode(value))
        }
    }

    return hexlify(toUtf8Bytes(value))
}