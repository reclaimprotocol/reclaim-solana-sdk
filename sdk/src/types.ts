import { PublicKey } from "@solana/web3.js";

export type WitnessData = {
  id: string;
  url: string;
};

export type BeaconState = {
  witnesses: WitnessData[];
  epoch: number;
  witnessesRequiredForClaim: number;
  nextEpochTimestampS: number;
};

export interface Beacon {
  /**
   * Get the witnesses for the epoch specified
   * or the current epoch if none is specified
   */
  getState(epoch?: number): Promise<BeaconState>;

  close?(): Promise<void>;
}

/**
 * Uniquely identifies a claim.
 * Hash of claim info.
 * Utilise `hashClaimInfo` to obtain this.
 */
export type ClaimID = string;

export type ClaimInfo = {
  provider: string;
  parameters: string;
  contextAddress: PublicKey;
  contextMessage: string;
};

export type AnyClaimInfo = ClaimInfo | { identifier: ClaimID };

export type CompleteClaimData = {
  owner: string;
  timestamp: number;
  epochIndex: number;
} & AnyClaimInfo;

export type SignedClaim = {
  claim: CompleteClaimData;
  signatures: Uint8Array[];
};

export type AuthToken = {
  /** wallet address of the user */
  id: string;
  /** unix timestamp in seconds */
  expiresAtS: number;
};

export type Claim = {
  identifier: ClaimID;
  provider: string;
  redactedParameters: string;
  ownerPublicKey: Uint8Array;
  timestampS: number;
  witnessAddresses: string[];
  epoch: number;
  context?: string;
};

export type EncryptedClaimProof = {
  identifier: ClaimID;
  enc: Uint8Array;
};

export type ClaimProof = {
  parameters: string;
  signatures: Uint8Array[];
};
