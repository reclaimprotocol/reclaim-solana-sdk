import {
  getEpochConfigPda,
  getEpochPda,
} from "@reclaimprotocol/solana-sdk/src";
import {
  createAddEpochInstruction,
  createInitializeEpochConfigInstruction,
} from "@reclaimprotocol/solana-sdk/src/generated";
import { createComputeLimitAndFeeIx, sendTransaction } from "../utils";
import {
  Keypair,
  SystemProgram,
  clusterApiUrl,
  Connection,
} from "@solana/web3.js";
import { readFileSync } from "fs";
import { resolve } from "path";
import { WitnessData } from "@reclaimprotocol/solana-sdk/src/types";

// Set up the connection to the specified network
const cluster = process.env.SOLANA_CLUSTER || "devnet";
// @ts-ignore
const connection = new Connection(clusterApiUrl(cluster), "confirmed");

// Load the wallet keypair from the specified path
const walletPath =
  process.env.SOLANA_WALLET ||
  resolve(process.env.HOME || "", ".config", "solana", "id.json");
const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(readFileSync(walletPath, "utf-8")))
);

(async function (
  epochs: { witnesses: WitnessData[]; minimumWitnessesForClaim: number }[]
) {
  try {
    const epochCreator = walletKeypair;

    const [epochConfigPda] = getEpochConfigPda({
      createKey: epochCreator.publicKey,
    });

    console.log(`Epoch config address: ${epochConfigPda.toString()}`);

    const computeLimitFeeIx = createComputeLimitAndFeeIx(400_000, 1);
    const createEpochConfigIx = createInitializeEpochConfigInstruction(
      {
        createKey: epochCreator.publicKey,
        deployer: epochCreator.publicKey,
        epochConfig: epochConfigPda,
      },
      {
        args: {
          epochDurationSeconds: 86_400, // 1 day
        },
      }
    );

    const backTrackEpochIxs = epochs.map(
      ({ minimumWitnessesForClaim, witnesses }, epochIndex) => {
        const [epochPda] = getEpochPda({
          epochConfig: epochConfigPda,
          epochIndex: Number(epochIndex + 1),
        });

        console.log(`Epoch address: ${epochPda.toString()}`);

        return createAddEpochInstruction(
          {
            deployer: epochCreator.publicKey,
            epochConfig: epochConfigPda,
            epoch: epochPda,
            rentPayer: epochCreator.publicKey,
            systemProgram: SystemProgram.programId,
          },
          {
            args: {
              minimumWitnessesForClaim: minimumWitnessesForClaim,
              witnesses: witnesses.map((w) => ({ address: w.id, url: w.url })),
            },
          }
        );
      }
    );

    const signature = await sendTransaction(
      connection,
      [...computeLimitFeeIx, createEpochConfigIx, ...backTrackEpochIxs],
      epochCreator.publicKey,
      [epochCreator]
    );

    console.log(`Epochs backfilled successfully: ${signature}`);
  } catch (err) {
    console.error("Failed to backfill epochs:", err);
  }
})([
  {
    witnesses: [
      {
        id: "0x244897572368eadf65bfbc5aec98d8e5443a9072",
        url: "https://reclaim-node.questbook.app",
      },
    ],
    minimumWitnessesForClaim: 1,
  },
]);
