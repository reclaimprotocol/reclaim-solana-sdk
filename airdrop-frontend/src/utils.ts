import { Wallet } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { ethers } from "ethers";

export function createComputeLimitAndFeeIx(units: number, feeLamports: number) {
  const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
    units,
  });

  const addPriorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: feeLamports,
  });

  return [modifyComputeUnitsIx, addPriorityFeeIx];
}

export function serializeHash(hash: string) {
  return Array.from(new Uint8Array(ethers.getBytes(hash)));
}

export async function sendTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  signers: Keypair[],
  skipPreflight: boolean = false
) {
  const computeFeeLimitIx = createComputeLimitAndFeeIx(500_000, 1);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const message = new TransactionMessage({
    instructions: [...computeFeeLimitIx, ...instructions],
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
  wallet: AnchorWallet | Wallet,
  signers: Keypair[],
  skipPreflight: boolean = false
) {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
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
