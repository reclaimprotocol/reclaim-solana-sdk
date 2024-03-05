import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import "../css/App.css";

import { Reclaim } from "@reclaimprotocol/js-sdk";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { IDL as TestAirdropIDL } from "../idl";
import { PublicKey, SystemProgram } from "@solana/web3.js";
// import { translateAndThrowAnchorError } from "sdk/lib/errors";
import { getEpochPda, getGroupPda } from "sdk";
import {
  createComputeLimitAndFeeIx,
  sendTransactionAnchor,
  serializeHash,
} from "../utils";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

const buttonSyle = {
  fontSize: "20px",
  padding: "10px 20px",
  margin: "10px 0",
  borderRadius: "5px",
  backgroundColor: "#512DA8",
  color: "white",
  fontWeight: "bold",
  border: "0",
  cursor: "pointer",
};

/** Change the following keys as per the environment you are working on (devnet, mainnet, localnet) */
const EPOCH_CONFIG_ADDRESS = new PublicKey("EPOCH CONFIG ADDRESS");

const AIRDROP_MINT_ADDRESS = new PublicKey("AIRDROP MINT ADDRESS");
/** */

// Reclaim program ID
const RECLAIM_PROGRAM_ID = new PublicKey("rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf");

// Airdrop program ID
const AIRDROP_PROGRAM_ID = new PublicKey("ArdPv6gtzY8HQuxzVQbZ8GHMRUatySoUv8jZH4vFj4Tm");

const contextMessage = "Application related context";

function App() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [verifyURL, setverifyURL] = useState<string | null>();

  useEffect(() => {
    setverifyURL(null);
  }, [wallet]);

  async function getVerificationReq() {
    if (wallet?.publicKey) {
      const publicKey = wallet.publicKey;
      const APP_ID = "YOUR APP ID";
      const APP_SECRET = "YOUR APP SECRET";
      const providerId = "HTML PROVIDER ID";
      const reclaimClient = new Reclaim.ProofRequest(APP_ID);

      console.log(`Connected wallet: ${wallet?.publicKey?.toString()}`);

      reclaimClient.addContext(publicKey.toString(), contextMessage);
      await reclaimClient.buildProofRequest(providerId);
      const signature = await reclaimClient.generateSignature(APP_SECRET);

      reclaimClient.setSignature(signature);
      const { requestUrl } = await reclaimClient.createVerificationRequest();
      setverifyURL(requestUrl);

      await reclaimClient.startSession({
        onSuccessCallback: (proof) => {
          console.log("Verification success", proof[0]);
          submitProof(proof[0]).then((txHash) => {
            console.log(txHash);
            alert(`Congrats! You just received 10 tokens`);
          });
        },
        onFailureCallback: (error) => {
          console.error("Verification failed", error);
          alert(error);
          setverifyURL(null);
        },
      });
    }
  }

  async function submitProof(data: any) {
    try {
      if (wallet) {
        const context = JSON.parse(data.claimData.context);
        const { provider, parameters, contextAddress, contextMessage } = {
          provider: data.claimData.provider,
          parameters: data.claimData.parameters,
          contextAddress: new PublicKey(context.contextAddress),
          contextMessage: context.contextMessage,
        };

        const {
          claimData: { identifier, owner, timestamp, epochIndex },
          signatures,
        } = {
          claimData: {
            identifier: data.identifier,
            owner: data.claimData.owner,
            timestamp: data.claimData.timestampS,
            epochIndex: data.claimData.epoch,
          },
          signatures: data.signatures,
        };

        const airdropProgram = new Program(
          TestAirdropIDL,
          AIRDROP_PROGRAM_ID,
          new AnchorProvider(connection, wallet, { commitment: "confirmed" })
        );

        // PDAs for reclaim
        const [epochPda] = getEpochPda({
          epochConfig: EPOCH_CONFIG_ADDRESS,
          epochIndex,
        });

        const [groupPda] = getGroupPda({ provider });

        const [airdropPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("airdrop_manager")],
          AIRDROP_PROGRAM_ID
        );

        // PDAs for airdrop
        const managerTokenAccount = getAssociatedTokenAddressSync(
          AIRDROP_MINT_ADDRESS,
          airdropPda,
          true,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const signerTokenAccount = getAssociatedTokenAddressSync(
          AIRDROP_MINT_ADDRESS,
          wallet.publicKey,
          false,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        let claimTx = await airdropProgram.methods
          .claimAirdrop({
            claimInfo: {
              provider,
              parameters,
              contextAddress,
              contextMessage,
            },
            signedClaim: {
              signatures: signatures.map((s: string) => serializeHash(s)),
              claimData: {
                identifier: serializeHash(identifier),
                epochIndex,
                timestamp,
                owner,
              },
            },
          })
          .accounts({
            /** Address who requested the proof */
            signer: wallet.publicKey,
            /** Reclaim related accounts */
            reclaimProgram: RECLAIM_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            epoch: epochPda,
            epochConfig: EPOCH_CONFIG_ADDRESS,
            /** Airdrop related accounts */
            airdrop: airdropPda,
            mint: AIRDROP_MINT_ADDRESS,
            managerTokenAccount,
            signerTokenAccount,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
          })
          .remainingAccounts([{ pubkey: groupPda, isWritable: true, isSigner: false }])
          // .preInstructions(createComputeLimitAndFeeIx(400_000, 1))
          .transaction();

        return sendTransactionAnchor(
          connection,
          claimTx.instructions,
          wallet.publicKey,
          wallet,
          []
        );
      }
    } catch (err) {
      // TODO: Log this error well
      // translateAndThrowAnchorError(err);
    } finally {
      setverifyURL(null);
    }
  }

  return (
    <div className="App">
      {wallet ? (
        <header className="App-header">
          <p>
            <code>Token Airdrop - Reclaim</code>
          </p>
          <button onClick={getVerificationReq} style={buttonSyle}>
            Verify and Claim
          </button>
          {verifyURL && (
            <>
              <button style={buttonSyle} onClick={() => window.open(verifyURL, "_blank")}>
                Open link
              </button>
              <QRCode style={{ marginTop: "20px" }} value={verifyURL} />
            </>
          )}
        </header>
      ) : (
        <p>Loading ...</p>
      )}
    </div>
  );
}

export default App;
