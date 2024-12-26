export class Digest {
    private hash: number[]
    private lastData: any
    private size: any

    constructor() {
        this.hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]
        this.size = 0
        this.lastData = undefined
    }

    update(data: Uint8Array) {
        if (this.lastData) {
            this.hash = this.sha256(bytesToWords(this.lastData), this.hash)
        }
        this.lastData = data
        this.size = this.size + data.length
        return this
    }

    sum() {
        if (this.lastData) {
            const nBitsTotal = this.size * 8
            const nBitsLeft = this.lastData.length * 8
            const nBitsTotalH = Math.floor(nBitsTotal / 0x100000000)
            const nBitsTotalL = nBitsTotal & 0xffffffff
            this.lastData = bytesToWords(this.lastData)
            this.lastData[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsTotal % 32))
            this.lastData[(((nBitsLeft + 64) >>> 9) << 4) + 14] = nBitsTotalH
            this.lastData[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotalL
            this.hash = this.sha256(this.lastData, this.hash)
        }

        return new Uint8Array(wordsToBytes(this.hash))
    }

    private sha256(m: number[], H: any[]) {
        let w: any[] = [],
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            t1,
            t2
        for (let i = 0; i < m.length; i += 16) {
            a = H[0]
            b = H[1]
            c = H[2]
            d = H[3]
            e = H[4]
            f = H[5]
            g = H[6]
            h = H[7]

            for (let j = 0; j < 64; j++) {
                if (j < 16) w[j] = m[j + i]
                else {
                    let gamma0x = w[j - 15]
                    let gamma1x = w[j - 2]
                    let gamma0 =
                        ((gamma0x << 25) | (gamma0x >>> 7)) ^ ((gamma0x << 14) | (gamma0x >>> 18)) ^ (gamma0x >>> 3)
                    let gamma1 =
                        ((gamma1x << 15) | (gamma1x >>> 17)) ^ ((gamma1x << 13) | (gamma1x >>> 19)) ^ (gamma1x >>> 10)

                    w[j] = gamma0 + (w[j - 7] >>> 0) + gamma1 + (w[j - 16] >>> 0)
                }

                let ch: number = (e & f) ^ (~e & g)
                let maj: number = (a & b) ^ (a & c) ^ (b & c)
                let sigma0: number = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22))
                let sigma1: number = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25))

                t1 = (h >>> 0) + sigma1 + ch + K[j] + (w[j] >>> 0)
                t2 = sigma0 + maj

                h = g
                g = f
                f = e
                e = (d + t1) >>> 0
                d = c
                c = b
                b = a
                a = (t1 + t2) >>> 0
            }

            H[0] = (H[0] + a) | 0
            H[1] = (H[1] + b) | 0
            H[2] = (H[2] + c) | 0
            H[3] = (H[3] + d) | 0
            H[4] = (H[4] + e) | 0
            H[5] = (H[5] + f) | 0
            H[6] = (H[6] + g) | 0
            H[7] = (H[7] + h) | 0
        }
        return H
    }
}

const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
    0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
    0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2
]

function bytesToWords(a: number[]): number[] {
    let b: number[] = []
    for (let c = 0, d = 0; c < a.length; c++, d += 8) {
        b[d >>> 5] |= a[c] << (24 - (d % 32))
    }
    return b
}

function wordsToBytes(a: number[]) {
    let b: number[] = []
    for (let c = 0; c < a.length * 32; c += 8) {
        b.push((a[c >>> 5] >>> (24 - (c % 32))) & 255)
    }
    return b
}

function bytesToHex(a: number[]): string {
    let b = []
    for (let c = 0; c < a.length; c++) {
        b.push((a[c] >>> 4).toString(16)), b.push((a[c] & 15).toString(16))
    }
    return b.join('')
}
