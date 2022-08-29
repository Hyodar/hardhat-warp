import {AddressType, ArrayType, BoolType, BuiltinStructType, BuiltinType, BytesType, ContractDefinition, EnumDefinition, FixedBytesType, FunctionType, IntType, MappingType, PointerType, StringType, TypeNameType, TypeNode, UserDefinedType} from "solc-typed-ast";

export type SolValue = string | SolValue[]

export function encodeValue(tp: TypeNode, value: SolValue, compilerVersion: string): string[] {
  if (tp instanceof IntType) {
    return encodeAsUintOrFelt(tp, value, tp.nBits);
  } else if (tp instanceof ArrayType) {
    if (!(value instanceof Array)) {
      throw new Error(`Can't encode ${value} as arrayType`);
    }
    if (tp.size === undefined) {
      return [
        value.length.toString(),
        ...value.flatMap((v) => encodeValue(tp.elementT, v, compilerVersion)),
      ];
    } else {
      return value.flatMap((v) => encodeValue(tp.elementT, v, compilerVersion));
    }
  } else if (tp instanceof BoolType) {
    if (typeof value !== 'boolean') {
      throw new Error(`Can't encode ${value} as boolType`);
    }
    return [value ? '1' : '0'];
  } else if (tp instanceof BytesType) {
    if (value === null) return ['0'];
    if (typeof value !== 'string') {
      throw new Error(`Can't encode ${value} as bytesType`);
    }
    // removing 0x
    value = value.substring(2);
    const length = value.length / 2;
    if (length !== Math.floor(length)) throw new Error('bytes must be even');

    const cairoBytes: string[] = [];
    for (let index = 0; index < value.length; index += 2) {
      const byte = value.substring(index, index + 2);
      cairoBytes.push(BigInt('0x' + byte).toString());
    }
    return [length.toString(), cairoBytes].flat();
  } else if (tp instanceof FixedBytesType) {
    return encodeAsUintOrFelt(tp, value, tp.size * 8);
  } else if (tp instanceof StringType) {
    if (typeof value !== 'string') {
      throw new Error(`Can't encode ${value} as stringType`);
    }
    const valueEncoded: number[] = Buffer.from(value).toJSON().data;

    const byteString: string[] = [];
    valueEncoded.forEach((val) => byteString.push(val.toString()));
    return [byteString.length.toString()].concat(byteString);
  } else if (tp instanceof AddressType) {
    return encodeAsUintOrFelt(tp, value, 160);
  } else if (tp instanceof BuiltinType) {
    throw new Error('Serialising BuiltinType not supported yet');
  } else if (tp instanceof BuiltinStructType) {
    throw new Error('Serialising BuiltinStructType not supported yet');
  } else if (tp instanceof MappingType) {
    throw new Error('Mappings cannot be serialised as external function paramenters');
  } else if (tp instanceof UserDefinedType) {
    throw new Error('UserDefinedType should not exist in raw abi');
  } else if (tp instanceof FunctionType) {
    throw new Error('Serialising FunctionType not supported yet');
  } else if (tp instanceof PointerType) {
    return encodeValue(tp.to, value, compilerVersion);
  }
  throw new Error(`Don't know how to convert type ${printTypeNode(tp)}`);
}

export function encodeAsUintOrFelt(tp: TypeNode, value: SolValue, nBits: number): string[] {
  if (typeof value !== 'string') {
    throw new Error(`Can't encode ${value} as ${printTypeNode(tp)}`);
  }
  try {
    return toUintOrFelt(BigInt(value.toString()), nBits).map((x) => x.toString());
  } catch {
    throw new Error(`Can't encode ${value} as ${printTypeNode(tp)}`);
  }
}

export function printTypeNode(node: TypeNode, detail?: boolean): string {
  let type = `${node.constructor.name}`;
  if (detail) {
    type = `${printTypeNodeTypes(node)}`;
  }
  return `${node.pp()} (${type})`;
}

function printTypeNodeTypes(node: TypeNode): string {
  let subTypes = '';
  if (node instanceof ArrayType) {
    subTypes = `(${printTypeNodeTypes(node.elementT)}, ${node.size})`;
  } else if (node instanceof MappingType) {
    subTypes = `(${printTypeNodeTypes(node.keyType)}, ${printTypeNodeTypes(node.valueType)})`;
  } else if (node instanceof PointerType) {
    subTypes = `(${printTypeNodeTypes(node.to)}, ${node.location})`;
  } else if (node instanceof TypeNameType) {
    subTypes = `(${printTypeNodeTypes(node.type)})`;
  }
  return `${node.constructor.name} ${subTypes}`;
}

const uint128 = BigInt('0x100000000000000000000000000000000');

export function toUintOrFelt(value: bigint, nBits: number): bigint[] {
  const val = bigintToTwosComplement(BigInt(value.toString()), nBits);
  if (nBits > 251) {
    const [high, low] = divmod(val, uint128);
    return [low, high];
  } else {
    return [val];
  }
}

export function divmod(x: bigint, y: bigint): [bigint, bigint] {
  const div = BigInt(x / y);
  const rem = BigInt(x % y);
  return [div, rem];
}

export function bigintToTwosComplement(val: bigint, width: number): bigint {
  if (val >= 0n) {
    // Non-negative values just need to be truncated to the given bitWidth
    const bits = val.toString(2);
    return BigInt(`0b${bits.slice(-width)}`);
  } else {
    // Negative values need to be converted to two's complement
    // This is done by flipping the bits, adding one, and truncating
    const absBits = (-val).toString(2);
    const allBits = `${'0'.repeat(Math.max(width - absBits.length, 0))}${absBits}`;
    const inverted = `0b${[...allBits].map((c) => (c === '0' ? '1' : '0')).join('')}`;
    const twosComplement = (BigInt(inverted) + 1n).toString(2).slice(-width);
    return BigInt(`0b${twosComplement}`);
  }
}
