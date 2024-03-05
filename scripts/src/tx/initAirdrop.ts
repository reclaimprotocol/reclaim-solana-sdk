import * as anchor from "@coral-xyz/anchor";
import {
  createComputeLimitAndFeeIx,
  createLocalhostConnection,
  generateFundedKeypair,
  sendTransaction,
  sendTransactionAnchor,
} from "../utils";

import { IDL, Airdrop } from "../airdrop-idl";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

(async function () {
  try {
    const airdropProgramId = new PublicKey(
      "ArdPv6gtzY8HQuxzVQbZ8GHMRUatySoUv8jZH4vFj4Tm"
    );

    const connection = createLocalhostConnection();
    const signer = await generateFundedKeypair(connection);
    const wallet = new NodeWallet(signer);

    const airdropProgram = new anchor.Program(
      IDL as Airdrop,
      airdropProgramId,
      new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" })
    );

    const mint = Keypair.generate();
    const [airdrop] = PublicKey.findProgramAddressSync(
      [Buffer.from("airdrop_manager")],
      airdropProgramId
    );

    const managerTokenAccount = getAssociatedTokenAddressSync(
      mint.publicKey,
      airdrop,
      true,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_PROGRAM_ID
    );

    const tx = await airdropProgram.methods
      .initAirdrop({
        mintAmount: new anchor.BN(10_000),
      })
      .accounts({
        airdrop,
        signer: wallet.publicKey,
        mint: mint.publicKey,
        managerTokenAccount,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .preInstructions(createComputeLimitAndFeeIx(250_000, 1))
      .transaction();

    const signature = await sendTransactionAnchor(
      connection,
      tx.instructions,
      wallet.publicKey,
      wallet,
      [mint]
    );

    console.log(
      `Signer: ${wallet.publicKey.toString()}\nAirdrop account: ${airdrop.toString()}\nMint: ${mint.publicKey.toString()}\nToken Manager Account: ${managerTokenAccount.toString()}\n\nSignature: ${signature}`
    );
  } catch (err) {
    console.log(err);
  }
})();
