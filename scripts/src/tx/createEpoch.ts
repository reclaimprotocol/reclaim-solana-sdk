import { getEpochPda } from "@reclaimprotocol/solana-sdk/src";
import { createAddEpochInstruction } from "@reclaimprotocol/solana-sdk/src/generated";

import {
  createComputeLimitAndFeeIx,
  createLocalhostConnection,
  sendTransaction,
} from "../utils";

import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { EpochConfig } from "@reclaimprotocol/solana-sdk/lib/generated";
import { WitnessData } from "@reclaimprotocol/solana-sdk/lib/types";

(async function (
  epochConfigPda: PublicKey,
  epochCreator: Keypair,
  epoch: { witnesses: WitnessData[]; minimumWitnessesForClaim: number }
) {
  try {
    const connection = createLocalhostConnection();
    const createKey = Keypair.generate();

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
      [epochCreator, createKey]
    );

    console.log(`Epoch created successfully: ${signature}`);
  } catch (err) {
    console.error(err);
  }
})(PublicKey.default, Keypair.generate(), {
  witnesses: [
    {
      id: "0x244897572368eadf65bfbc5aec98d8e5443a9072",
      url: "https://reclaim-node.questbook.app",
    },
  ],
  minimumWitnessesForClaim: 1,
});
