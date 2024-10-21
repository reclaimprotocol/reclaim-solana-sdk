import { getEpochPda } from "@reclaimprotocol/solana-sdk/src";
import { createAddEpochInstruction } from "@reclaimprotocol/solana-sdk/src/generated";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createComputeLimitAndFeeIx, sendTransaction } from "../utils";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import { EpochConfig } from "@reclaimprotocol/solana-sdk/lib/generated";
import { WitnessData } from "@reclaimprotocol/solana-sdk/lib/types";

// Get the epochConfigPda from command-line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("Please provide the epochConfigPda as the first argument.");
  process.exit(1);
}

const epochConfigPda = new PublicKey(args[0]);

const walletPath =
  process.env.SOLANA_WALLET ||
  resolve(process.env.HOME || "", ".config", "solana", "id.json");
const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(readFileSync(walletPath, "utf-8")))
);

(async function (
  epochConfigPda: PublicKey,
  epoch: { witnesses: WitnessData[]; minimumWitnessesForClaim: number }
) {
  try {
    const cluster = process.env.SOLANA_CLUSTER || "devnet"; // Default to devnet if not specified
    // @ts-ignore
    const connection = new Connection(clusterApiUrl(cluster), "confirmed");

    const epochCreator = walletKeypair;

    console.log(`Epoch config address: ${epochConfigPda.toString()}`);

    const computeLimitFeeIx = createComputeLimitAndFeeIx(200_000, 1);
    const { epochIndex } = await EpochConfig.fromAccountAddress(
      connection,
      epochConfigPda
    );

    const [epochPda] = getEpochPda({
      epochConfig: epochConfigPda,
      epochIndex: Number(epochIndex + 1),
    });

    console.log(`Epoch address: ${epochPda.toString()}`);

    const { witnesses, minimumWitnessesForClaim } = epoch;
    const createEpochIx = createAddEpochInstruction(
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

    const signature = await sendTransaction(
      connection,
      [...computeLimitFeeIx, createEpochIx],
      epochCreator.publicKey,
      [epochCreator]
    );

    console.log(`Epoch created successfully: ${signature}`);
  } catch (err) {
    console.error("Failed to create epoch:", err);
  }
})(epochConfigPda, {
  witnesses: [
    {
      id: "0x244897572368eadf65bfbc5aec98d8e5443a9072",
      url: "https://reclaim-node.questbook.app",
    },
  ],
  minimumWitnessesForClaim: 1,
});
