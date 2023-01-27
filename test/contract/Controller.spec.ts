import {Controller} from "../../src/contract/Controller"
import {Blockchain} from "../../src/contract/Blockchain"
import {BlockAddress} from "../../src/model/BlockAddress"
import {Resolver} from "../../src/resolver/Resolver"
import {SigningKey} from '@ethersproject/signing-key'
import {sleep} from "../../src/tool/common";

jest.setTimeout(600000);

describe('Contract Controller', () => {
    let account1: BlockAddress
    let account2: BlockAddress
    let account3: BlockAddress
    let identifier: string

    beforeAll(async () => {
        account1 = {
            address: "0x00af591a41D413e127e757BaBF1f3CC1B2eA72ea",
            privateKey: "0x01422bbc1c2854ac02e06ece1b7e38049249037ba557586b529e01372b17946c",
            publicKey: "0x03259260c1aa08559ccd2dbaeaf6400a4a5c87432ae043400c5560a7d99302e027",
            identifier: "did:ethr:0x7e4:0x03259260c1aa08559ccd2dbaeaf6400a4a5c87432ae043400c5560a7d99302e027"
        }

        account2 = {
            address: "0x6529f491bE4063Bc6a866317Af04063B59d1B4Bc",
            privateKey: "0x733e60e0daf080de5d45040d1da35d652ea3d6e0052b9c20c62eaf05ec97b3d3",
            publicKey: "0x03ee9f20e878602595ee81859705bc96fa2ccef5cf224469546e4e241cd6b77a42",
            identifier: "did:ethr:0x7e4:0x03ee9f20e878602595ee81859705bc96fa2ccef5cf224469546e4e241cd6b77a42"
        }

        identifier = account2.identifier

        account3 = {
            address: "0xF4DA822A8642A0adCEFff86d99d2789f1DacB513",
            privateKey: "0x7b38b5f87fbe222193b17f3d8d4af3e2b75f89889e5df68283c47f54affd4f69",
            publicKey: "0x02a58e0fb0b09295538fd69eefb1d884bc52d9f2507cbd1db89230aa537b87d0ce",
            identifier: "did:ethr:0x7e4:0x02a58e0fb0b09295538fd69eefb1d884bc52d9f2507cbd1db89230aa537b87d0ce"
        };
    })

    describe('Get owner', () => {
        it('Get owner', async () => {
            const signer = Blockchain.getDefaultSigner(account1.privateKey);
            const controller = new Controller(account1.identifier, Blockchain.getDefaultContract(signer));
            const address = await controller.getOwner();
            console.log(`address=${address}`);
            expect(address).toEqual(account1.address);
        });
    })

    describe('Change owner ', () => {
        it('Without signed information', async () => {
            const contract = Blockchain.getDefaultContract(Blockchain.getDefaultSigner(account2.privateKey))
            const controller = new Controller(identifier, contract);
            const currentOwner = await controller.getOwner();
            console.log(`Current owner=${currentOwner}`)
            const owner = currentOwner === account2.address ? account2 : account3;
            const newOwner = currentOwner === account2.address ? account3 : account2;
            const blockHeightBeforeChange = (await Blockchain.getDefaultProvider().getBlock('latest')).number
            console.log(`Current height=${blockHeightBeforeChange}`)

            const receipt = await controller.setOwner(newOwner.address, Blockchain.getDefaultSigner(owner.privateKey));
            console.log(`Hash=${JSON.stringify(receipt)}`)
            const newAddress = await controller.getOwner();
            console.log(`New owner=${newAddress}`);
            expect(newAddress).toEqual(newOwner.address);
            await sleep(1000)

            // resolver owner
            const result = await new Resolver(contract).resolve(identifier)
            console.log(`After set Owner=${JSON.stringify(result)}`)
            console.log(`Actual write Block=${result.didDocumentMetadata.versionId}`)
            expect(Number(result.didDocumentMetadata.versionId)).toBeGreaterThanOrEqual(blockHeightBeforeChange + 1)
            expect(result.didDocument?.verificationMethod).toBeDefined()
            if (result.didDocument?.verificationMethod !== undefined) {
                const myController = result.didDocument?.verificationMethod.find(s => s.id === `${identifier}#controller`)
                expect(myController).toEqual({
                    id: `${identifier}#controller`,
                    type: 'EcdsaSecp256k1RecoveryMethod2020',
                    controller: identifier,
                    blockchainAccountId: `eip155:2020:${newOwner.address}`,
                })
            }
        })

        it('With signed information', async () => {
            const signer = Blockchain.getDefaultSigner(account2.privateKey)
            const contract = Blockchain.getDefaultContract(signer)
            const controller = new Controller(identifier, contract);
            const currentOwner = await controller.getOwner();
            console.log(`current owner=${currentOwner}`)
            const owner = currentOwner === account2.address ? account2 : account3;
            const newOwner = currentOwner === account2.address ? account3 : account2;

            const nonce1 = await contract.functions.nonce(owner.address)
            console.log(`${nonce1[0]._hex}`)

            const hash = await controller.createSetOwnerHash(newOwner.address)
            const signature = new SigningKey(owner.privateKey).signDigest(hash)

            const receipt = await controller.setOwnerSigned(
                newOwner.address,
                {
                    sigV: signature.v,
                    sigR: signature.r,
                    sigS: signature.s,
                },
                Blockchain.getDefaultSigner(newOwner.privateKey))
            console.log(`hash=${JSON.stringify(receipt)}`)

            const nonce2 = await contract.functions.nonce(owner.address)
            console.log(`nonce has changed from ${nonce1} to ${nonce2}`)
            expect(Number(nonce2[0]._hex)).toEqual(Number(nonce1[0]._hex) + 1)
        })
    })
    describe('Set attribute', () => {
        it('Without signed information', async () => {
            const contract = Blockchain.getDefaultContract(Blockchain.getDefaultSigner(account2.privateKey))
            const controller = new Controller(identifier, contract);
            const currentOwner = await controller.getOwner();
            const owner = currentOwner === account2.address ? account2 : account3;
            const serviceEndpointParams = {uri: 'https://yeying.hub', transportType: 'https'}
            const attributeName = 'did/svc/test1'
            const attributeValue = JSON.stringify(serviceEndpointParams)
            const attributeExpiration = 86400
            const receipt = await controller.setAttribute(attributeName, attributeValue, attributeExpiration,
                Blockchain.getDefaultSigner(owner.privateKey))
            console.log(`hash=${JSON.stringify(receipt)}`)
        })

        it('With signed information', async () => {
            const contract = Blockchain.getDefaultContract(Blockchain.getDefaultSigner(account2.privateKey))
            const controller = new Controller(identifier, contract);
            const currentOwner = await controller.getOwner();
            const owner = currentOwner === account2.address ? account2 : account3;
            const nonce1 = await contract.functions.nonce(owner.address)

            const serviceEndpointParams = {uri: 'https://yeying.hub', transportType: 'https'}
            const attributeName = 'did/svc/test'
            const attributeValue = JSON.stringify(serviceEndpointParams)
            const attributeExpiration = 86400

            const hash2 = await controller.createSetAttributeHash(attributeName, attributeValue, attributeExpiration)
            const signature2 = new SigningKey(owner.privateKey).signDigest(hash2)

            const receipt = await controller.setAttributeSigned(attributeName, attributeValue, attributeExpiration, {
                sigV: signature2.v,
                sigR: signature2.r,
                sigS: signature2.s,
            }, Blockchain.getDefaultSigner(owner.privateKey))
            console.log(`hash=${JSON.stringify(receipt)}`)

            const nonce2 = await contract.functions.nonce(owner.address)
            expect(Number(nonce2[0]._hex)).toEqual(Number(nonce1[0]._hex) + 1)
        })
    })
})



