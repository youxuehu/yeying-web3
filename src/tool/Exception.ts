export enum Exception {
    /**
     * The resolver has failed to construct the DID document.
     * This can be caused by a network issue, a wrong registry address or malformed logs while parsing the registry history.
     * Please inspect the `DIDResolutionMetadata.message` to debug further.
     */
    NotFound = 'NotFound',

    /**
     * The resolver does not know how to resolve the given DID. Most likely it is not a `did:ethr`.
     */
    InvalidDid = 'InvalidDid',

    /**
     * Not supported network.
     */
    UnknownNetwork = 'UnknownNetwork',
}