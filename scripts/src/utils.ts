import { Wallet } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
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

import { EpochConfig } from "@reclaimprotocol/solana-sdk/src/accounts";
import { toBigInt } from "@reclaimprotocol/solana-sdk/src/utils";

export function createLocalhostConnection() {
  return new Connection("http://127.0.0.1:8899", "confirmed");
}

export function createRPCConnection(rpcUrl: string) {
  return new Connection(rpcUrl, "confirmed");
}

// This address will be updated when running `yarn setup`
export function getTestProgramId() {
  return new PublicKey("2NRByeqyVqXf4LByQP8aTAnWToK9zCwV8JSBZTW2gQAq");
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

export async function generateFundedKeypair(
  connection: Connection,
  solAmount?: number
) {
  const keypair = Keypair.generate();

  const tx = await connection.requestAirdrop(
    keypair.publicKey,
    (solAmount ?? 1) * LAMPORTS_PER_SOL
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

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
  let epochConfigAccount = await EpochConfig.fromAccountAddress(
    connection,
    epochConfig
  );
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
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
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

export async function sendTransactionAnchor(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  wallet: Wallet | NodeWallet,
  signers: Keypair[],
  skipPreflight: boolean = false
) {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    instructions,
    payerKey: payer,
    recentBlockhash: blockhash,
  }).compileToV0Message();

  const tx = new VersionedTransaction(message);
  const signedTx = await wallet.signTransaction(tx);
  signedTx.sign(signers);

  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight,
  });
  await connection.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature,
  });

  return signature;
}
