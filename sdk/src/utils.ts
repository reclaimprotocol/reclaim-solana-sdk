import { bignum, u8, u32, u64 } from "@metaplex-foundation/beet";
import { ClaimInfo } from "./types";
import { claimInfoBeet } from "./generated";

export function toBigInt(number: bignum): bigint {
  return BigInt(number.toString());
}

export function toU8Bytes(num: number): Uint8Array {
  const bytes = Buffer.alloc(1);
  u8.write(bytes, 0, num);
  return bytes;
}

export function toU32Bytes(num: number): Uint8Array {
  const bytes = Buffer.alloc(4);
  u32.write(bytes, 0, num);
  return bytes;
}

export function toU64Bytes(num: number): Uint8Array {
  const bytes = Buffer.alloc(4);
  u64.write(bytes, 0, num);
  return bytes;
}
