import { BeaconState, ClaimInfo, WitnessData, ClaimID } from "./types";
import { keccak256, ethers, HDNodeWallet } from "ethers";

export function hashClaimInfo(info: ClaimInfo): ClaimID {
  const str = [
    info.provider,
    info.parameters,
    JSON.stringify({
      contextAddress: info.contextAddress.toString(),
      contextMessage: info.contextMessage,
    }),
  ].join("\n");
  return keccak256(Buffer.from(str, "utf-8")).toLowerCase();
}

/**
 * Compute the list of witnesses that need to be
 * contacted for a claim
 *
 * @param state current beacon state
 * @param identifier params of the claim
 * @param timestampS timestamp of the claim
 */
export function fetchWitnessListForClaim(
  { witnesses, witnessesRequiredForClaim, epoch }: BeaconState,
  params: string | ClaimInfo,
  timestampS: number
) {
  const identifier = typeof params === "string" ? params : hashClaimInfo(params);
  // include the epoch and
  // witnessesRequiredForClaim in the hash
  // so the same claim can be made multiple times
  // with different witnesses
  const completeInput = [
    identifier,
    epoch.toString(),
    witnessesRequiredForClaim.toString(),
    timestampS.toString(),
  ].join("\n");
  const completeHashStr = keccak256(Buffer.from(completeInput, "utf-8"));
  const completeHash = Buffer.from(completeHashStr.slice(2), "hex");
  const witnessesLeft = [...witnesses];
  const selectedWitnesses: WitnessData[] = [];
  // we'll use 32 bits of the hash to select
  // each witness
  let byteOffset = 0;
  for (let i = 0; i < witnessesRequiredForClaim; i++) {
    const randomSeed = completeHash.readUint32BE(byteOffset);
    const witnessIndex = randomSeed % witnessesLeft.length;
    const witness = witnessesLeft[witnessIndex];
    selectedWitnesses.push(witness);

    // Remove the selected witness from the list of witnesses left
    witnessesLeft[witnessIndex] = witnessesLeft[witnessesLeft.length - 1];
    witnessesLeft.pop();
    byteOffset = (byteOffset + 4) % completeHash.length;
  }

  return selectedWitnesses;
}

export async function witnessSelectSignMessage({
  witnesses,
  message,
  epochIndex,
  timestamp,
  minimumWitnessesForClaim,
  identifier,
}: {
  witnesses: { wallet: HDNodeWallet; id: string; url: string }[];
  message: string;
  epochIndex: number;
  timestamp: number;
  minimumWitnessesForClaim: number;
  identifier: string;
}) {
  const selectedWitnesses = fetchWitnessListForClaim(
    {
      witnesses: witnesses.map(({ id, url }) => ({ id, url })),
      epoch: epochIndex,
      witnessesRequiredForClaim: minimumWitnessesForClaim,
      nextEpochTimestampS: 0,
    },
    identifier,
    timestamp
  ).map((w) => w.id);

  console.log("Selected Witnesses:", selectedWitnesses);

  return Promise.all(
    witnesses
      .filter((w) => selectedWitnesses.includes(w.id))
      .map((w) => w.wallet.signMessage(message))
  );
}

export function serializeHash(hash: string) {
  return [...new Uint8Array(ethers.getBytes(hash))];
}
