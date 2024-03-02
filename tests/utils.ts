import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionMessage,
  TransactionInstruction,
  VersionedTransaction,
  Signer,
  ComputeBudgetProgram,
} from "@solana/web3.js";

import testProgramKeypair from "../program-keypairs/reclaim-program-keypair.json";
import { EpochConfig } from "sdk/src/accounts";
import { toBigInt } from "sdk/src/utils";

export function createLocalhostConnection() {
  return new Connection("http://127.0.0.1:8899", "confirmed");
}

export function getTestProgramId() {
  const programKeypair = Keypair.fromSecretKey(Buffer.from(testProgramKeypair));
  return programKeypair.publicKey;
}

export function createComputeLimitAndFeeIx(units: number, feeLamports: number) {
  const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
    units,
  });

  const addPriorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: feeLamports,
  });

  return [modifyComputeUnitsIx, addPriorityFeeIx];
}

export async function generateFundedKeypair(connection: Connection, solAmount?: number) {
  const keypair = Keypair.generate();

  const tx = await connection.requestAirdrop(
    keypair.publicKey,
    (solAmount ?? 1) * LAMPORTS_PER_SOL
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: tx,
  });

  return keypair;
}

export async function getEpochConfigEpochIndex(
  connection: Connection,
  epochConfig: PublicKey
) {
  let epochConfigAccount = await EpochConfig.fromAccountAddress(connection, epochConfig);
  const epochIndex = toBigInt(epochConfigAccount.epochIndex) + 1n;
  return epochIndex;
}

export async function sendTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  signers: Signer[],
  skipPreflight: boolean = false
) {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    instructions,
    payerKey: payer,
    recentBlockhash: blockhash,
  }).compileToV0Message();

  const tx = new VersionedTransaction(message);
  tx.sign(signers);
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight,
  });
  await connection.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature,
  });

  return signature;
}
