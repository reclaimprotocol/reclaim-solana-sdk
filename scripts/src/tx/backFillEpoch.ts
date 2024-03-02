import { getEpochConfigPda, getEpochPda } from "sdk/src";
import {
  createAddEpochInstruction,
  createInitializeEpochConfigInstruction,
} from "sdk/src/generated";

import {
  createComputeLimitAndFeeIx,
  createLocalhostConnection,
  generateFundedKeypair,
  sendTransaction,
} from "../utils";

import { Keypair, SystemProgram } from "@solana/web3.js";
import { WitnessData } from "sdk/src/types";

(async function (
  epochs: { witnesses: WitnessData[]; minimumWitnessesForClaim: number }[]
) {
  try {
    const connection = createLocalhostConnection();

    const epochCreator = await generateFundedKeypair(connection);
    const createKey = Keypair.generate();

    const [epochConfigPda] = getEpochConfigPda({
      createKey: createKey.publicKey,
    });

    console.log(`Epoch config address: ${epochConfigPda.toString()}`);

    const computeLimitFeeIx = createComputeLimitAndFeeIx(400_000, 1);
    const createEpochConfigIx = createInitializeEpochConfigInstruction(
      {
        createKey: createKey.publicKey,
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
      [epochCreator, createKey]
    );

    console.log(`Epochs backfilled successfully: ${signature}`);
  } catch (err) {
    console.error(err);
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
