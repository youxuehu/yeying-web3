import * as jspb from 'google-protobuf'



export class Identity extends jspb.Message {
  getMetadata(): IdentityMetadata | undefined;
  setMetadata(value?: IdentityMetadata): Identity;
  hasMetadata(): boolean;
  clearMetadata(): Identity;

  getBlockaddress(): string;
  setBlockaddress(value: string): Identity;

  getSecurityconfig(): SecurityConfig | undefined;
  setSecurityconfig(value?: SecurityConfig): Identity;
  hasSecurityconfig(): boolean;
  clearSecurityconfig(): Identity;

  getPersonalextend(): IdentityPersonalExtend | undefined;
  setPersonalextend(value?: IdentityPersonalExtend): Identity;
  hasPersonalextend(): boolean;
  clearPersonalextend(): Identity;

  getServiceextend(): IdentityServiceExtend | undefined;
  setServiceextend(value?: IdentityServiceExtend): Identity;
  hasServiceextend(): boolean;
  clearServiceextend(): Identity;

  getOrganizationextend(): IdentityOrganizationExtend | undefined;
  setOrganizationextend(value?: IdentityOrganizationExtend): Identity;
  hasOrganizationextend(): boolean;
  clearOrganizationextend(): Identity;

  getApplicationextend(): IdentityApplicationExtend | undefined;
  setApplicationextend(value?: IdentityApplicationExtend): Identity;
  hasApplicationextend(): boolean;
  clearApplicationextend(): Identity;

  getSignature(): string;
  setSignature(value: string): Identity;

  getExtendCase(): Identity.ExtendCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Identity.AsObject;
  static toObject(includeInstance: boolean, msg: Identity): Identity.AsObject;
  static serializeBinaryToWriter(message: Identity, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Identity;
  static deserializeBinaryFromReader(message: Identity, reader: jspb.BinaryReader): Identity;
}

export namespace Identity {
  export type AsObject = {
    metadata?: IdentityMetadata.AsObject,
    blockaddress: string,
    securityconfig?: SecurityConfig.AsObject,
    personalextend?: IdentityPersonalExtend.AsObject,
    serviceextend?: IdentityServiceExtend.AsObject,
    organizationextend?: IdentityOrganizationExtend.AsObject,
    applicationextend?: IdentityApplicationExtend.AsObject,
    signature: string,
  }

  export enum ExtendCase { 
    EXTEND_NOT_SET = 0,
    PERSONALEXTEND = 4,
    SERVICEEXTEND = 5,
    ORGANIZATIONEXTEND = 6,
    APPLICATIONEXTEND = 7,
  }
}

export class IdentityMetadata extends jspb.Message {
  getParent(): string;
  setParent(value: string): IdentityMetadata;

  getNetwork(): NetworkTypeEnum;
  setNetwork(value: NetworkTypeEnum): IdentityMetadata;

  getDid(): string;
  setDid(value: string): IdentityMetadata;

  getVersion(): number;
  setVersion(value: number): IdentityMetadata;

  getAddress(): string;
  setAddress(value: string): IdentityMetadata;

  getName(): string;
  setName(value: string): IdentityMetadata;

  getDescription(): string;
  setDescription(value: string): IdentityMetadata;

  getCode(): IdentityCodeEnum;
  setCode(value: IdentityCodeEnum): IdentityMetadata;

  getAvatar(): string;
  setAvatar(value: string): IdentityMetadata;

  getCreated(): string;
  setCreated(value: string): IdentityMetadata;

  getCheckpoint(): string;
  setCheckpoint(value: string): IdentityMetadata;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IdentityMetadata.AsObject;
  static toObject(includeInstance: boolean, msg: IdentityMetadata): IdentityMetadata.AsObject;
  static serializeBinaryToWriter(message: IdentityMetadata, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IdentityMetadata;
  static deserializeBinaryFromReader(message: IdentityMetadata, reader: jspb.BinaryReader): IdentityMetadata;
}

export namespace IdentityMetadata {
  export type AsObject = {
    parent: string,
    network: NetworkTypeEnum,
    did: string,
    version: number,
    address: string,
    name: string,
    description: string,
    code: IdentityCodeEnum,
    avatar: string,
    created: string,
    checkpoint: string,
  }
}

export class BlockAddress extends jspb.Message {
  getIdentifier(): string;
  setIdentifier(value: string): BlockAddress;

  getAddress(): string;
  setAddress(value: string): BlockAddress;

  getPrivatekey(): string;
  setPrivatekey(value: string): BlockAddress;

  getPublickey(): string;
  setPublickey(value: string): BlockAddress;

  getMnemonic(): Mnemonic | undefined;
  setMnemonic(value?: Mnemonic): BlockAddress;
  hasMnemonic(): boolean;
  clearMnemonic(): BlockAddress;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockAddress.AsObject;
  static toObject(includeInstance: boolean, msg: BlockAddress): BlockAddress.AsObject;
  static serializeBinaryToWriter(message: BlockAddress, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockAddress;
  static deserializeBinaryFromReader(message: BlockAddress, reader: jspb.BinaryReader): BlockAddress;
}

export namespace BlockAddress {
  export type AsObject = {
    identifier: string,
    address: string,
    privatekey: string,
    publickey: string,
    mnemonic?: Mnemonic.AsObject,
  }
}

export class Mnemonic extends jspb.Message {
  getPhrase(): string;
  setPhrase(value: string): Mnemonic;

  getPath(): string;
  setPath(value: string): Mnemonic;

  getLocale(): string;
  setLocale(value: string): Mnemonic;

  getPassword(): string;
  setPassword(value: string): Mnemonic;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Mnemonic.AsObject;
  static toObject(includeInstance: boolean, msg: Mnemonic): Mnemonic.AsObject;
  static serializeBinaryToWriter(message: Mnemonic, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Mnemonic;
  static deserializeBinaryFromReader(message: Mnemonic, reader: jspb.BinaryReader): Mnemonic;
}

export namespace Mnemonic {
  export type AsObject = {
    phrase: string,
    path: string,
    locale: string,
    password: string,
  }
}

export class IdentityServiceExtend extends jspb.Message {
  getCode(): string;
  setCode(value: string): IdentityServiceExtend;

  getApis(): string;
  setApis(value: string): IdentityServiceExtend;

  getProxy(): string;
  setProxy(value: string): IdentityServiceExtend;

  getGrpc(): string;
  setGrpc(value: string): IdentityServiceExtend;

  getExtend(): string;
  setExtend(value: string): IdentityServiceExtend;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IdentityServiceExtend.AsObject;
  static toObject(includeInstance: boolean, msg: IdentityServiceExtend): IdentityServiceExtend.AsObject;
  static serializeBinaryToWriter(message: IdentityServiceExtend, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IdentityServiceExtend;
  static deserializeBinaryFromReader(message: IdentityServiceExtend, reader: jspb.BinaryReader): IdentityServiceExtend;
}

export namespace IdentityServiceExtend {
  export type AsObject = {
    code: string,
    apis: string,
    proxy: string,
    grpc: string,
    extend: string,
  }
}

export class IdentityOrganizationExtend extends jspb.Message {
  getAddress(): string;
  setAddress(value: string): IdentityOrganizationExtend;

  getCode(): string;
  setCode(value: string): IdentityOrganizationExtend;

  getExtend(): string;
  setExtend(value: string): IdentityOrganizationExtend;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IdentityOrganizationExtend.AsObject;
  static toObject(includeInstance: boolean, msg: IdentityOrganizationExtend): IdentityOrganizationExtend.AsObject;
  static serializeBinaryToWriter(message: IdentityOrganizationExtend, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IdentityOrganizationExtend;
  static deserializeBinaryFromReader(message: IdentityOrganizationExtend, reader: jspb.BinaryReader): IdentityOrganizationExtend;
}

export namespace IdentityOrganizationExtend {
  export type AsObject = {
    address: string,
    code: string,
    extend: string,
  }
}

export class IdentityPersonalExtend extends jspb.Message {
  getEmail(): string;
  setEmail(value: string): IdentityPersonalExtend;

  getTelephone(): string;
  setTelephone(value: string): IdentityPersonalExtend;

  getExtend(): string;
  setExtend(value: string): IdentityPersonalExtend;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IdentityPersonalExtend.AsObject;
  static toObject(includeInstance: boolean, msg: IdentityPersonalExtend): IdentityPersonalExtend.AsObject;
  static serializeBinaryToWriter(message: IdentityPersonalExtend, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IdentityPersonalExtend;
  static deserializeBinaryFromReader(message: IdentityPersonalExtend, reader: jspb.BinaryReader): IdentityPersonalExtend;
}

export namespace IdentityPersonalExtend {
  export type AsObject = {
    email: string,
    telephone: string,
    extend: string,
  }
}

export class IdentityApplicationExtend extends jspb.Message {
  getCode(): string;
  setCode(value: string): IdentityApplicationExtend;

  getServicecodesList(): Array<string>;
  setServicecodesList(value: Array<string>): IdentityApplicationExtend;
  clearServicecodesList(): IdentityApplicationExtend;
  addServicecodes(value: string, index?: number): IdentityApplicationExtend;

  getLocation(): string;
  setLocation(value: string): IdentityApplicationExtend;

  getHash(): string;
  setHash(value: string): IdentityApplicationExtend;

  getExtend(): string;
  setExtend(value: string): IdentityApplicationExtend;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IdentityApplicationExtend.AsObject;
  static toObject(includeInstance: boolean, msg: IdentityApplicationExtend): IdentityApplicationExtend.AsObject;
  static serializeBinaryToWriter(message: IdentityApplicationExtend, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IdentityApplicationExtend;
  static deserializeBinaryFromReader(message: IdentityApplicationExtend, reader: jspb.BinaryReader): IdentityApplicationExtend;
}

export namespace IdentityApplicationExtend {
  export type AsObject = {
    code: string,
    servicecodesList: Array<string>,
    location: string,
    hash: string,
    extend: string,
  }
}

export class SecurityConfig extends jspb.Message {
  getAlgorithm(): SecurityAlgorithm | undefined;
  setAlgorithm(value?: SecurityAlgorithm): SecurityConfig;
  hasAlgorithm(): boolean;
  clearAlgorithm(): SecurityConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SecurityConfig.AsObject;
  static toObject(includeInstance: boolean, msg: SecurityConfig): SecurityConfig.AsObject;
  static serializeBinaryToWriter(message: SecurityConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SecurityConfig;
  static deserializeBinaryFromReader(message: SecurityConfig, reader: jspb.BinaryReader): SecurityConfig;
}

export namespace SecurityConfig {
  export type AsObject = {
    algorithm?: SecurityAlgorithm.AsObject,
  }
}

export class SecurityAlgorithm extends jspb.Message {
  getName(): string;
  setName(value: string): SecurityAlgorithm;

  getIv(): string;
  setIv(value: string): SecurityAlgorithm;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SecurityAlgorithm.AsObject;
  static toObject(includeInstance: boolean, msg: SecurityAlgorithm): SecurityAlgorithm.AsObject;
  static serializeBinaryToWriter(message: SecurityAlgorithm, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SecurityAlgorithm;
  static deserializeBinaryFromReader(message: SecurityAlgorithm, reader: jspb.BinaryReader): SecurityAlgorithm;
}

export namespace SecurityAlgorithm {
  export type AsObject = {
    name: string,
    iv: string,
  }
}

export enum IdentityCodeEnum { 
  IDENTITY_CODE_UNKNOWN = 0,
  IDENTITY_CODE_PERSONAL = 1,
  IDENTITY_CODE_ORGANIZATION = 2,
  IDENTITY_CODE_SERVICE = 3,
  IDENTITY_CODE_APPLICATION = 4,
  IDENTITY_CODE_ASSET = 5,
}
export enum NetworkTypeEnum { 
  NETWORK_TYPE_UNKNOWN = 0,
  NETWORK_TYPE_YEYING = 2020,
}
