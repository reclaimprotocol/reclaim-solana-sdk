import assert from "assert";

import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";

import { Wallet, HDNodeWallet, keccak256, hashMessage } from "ethers";
import {
  createComputeLimitAndFeeIx,
  createLocalhostConnection,
  generateFundedKeypair,
  getEpochConfigEpochIndex,
  sendTransaction,
} from "../utils";
import {
  hashClaimInfo,
  serializeHash,
  witnessSelectSignMessage,
} from "sdk/src/eth-utils";
import { ClaimInfo, CompleteClaimData, WitnessData } from "sdk/src/types";
import {
  Dapp,
  Epoch,
  EpochConfig,
  Group,
  createAddEpochInstruction,
  createCreateDappInstruction,
  createCreateGroupInstruction,
  createInitializeEpochConfigInstruction,
} from "sdk/src/generated";
import { getDappPda, getEpochConfigPda, getEpochPda, getGroupPda } from "sdk/src";
import { translateAndThrowAnchorError } from "sdk/src/errors";
import { createVerifyProofInstruction } from "sdk/lib/generated";

const connection = createLocalhostConnection();

describe("Reclaim group tests", () => {
  const minimumWitnessesForClaim = 3;

  let epochConfigCreator: Keypair;
  let groupCreator: Keypair;
  let owner: string; // Ethereum address
  // TODO: Not sure if this is same as groupCreator
  let dappCreator: Keypair;

  let ethWitnesses: { wallet: HDNodeWallet; id: string; url: string }[];
  let groupProvider: string;
  let memberParams: string;

  let epochConfigPda: PublicKey;
  let epochPda: PublicKey;
  let groupPda: PublicKey;
  let dappPda: PublicKey;

  before(async () => {
    const hostTemplate = "https://localhost:500";
    ethWitnesses = Array(5)
      .fill(1)
      .map((_, i) => {
        const wallet = Wallet.createRandom();
        return {
          wallet,
          id: wallet.address.toString(),
          url: hostTemplate + i,
        };
      });

    epochConfigCreator = await generateFundedKeypair(connection);
    groupCreator = await generateFundedKeypair(connection);
    owner = HDNodeWallet.createRandom().address.toString();
    dappCreator = await generateFundedKeypair(connection);

    groupProvider = "uid-dob";
    memberParams = "{'dob':'1988-02-10'}";
  });

  it("Creates an epoch config", async () => {
    const createKey = Keypair.generate();
    [epochConfigPda] = getEpochConfigPda({
      createKey: createKey.publicKey,
    });

    const createEpochConfigIx = createInitializeEpochConfigInstruction(
      {
        createKey: createKey.publicKey,
        deployer: epochConfigCreator.publicKey,
        epochConfig: epochConfigPda,
      },
      {
        args: {
          epochDurationSeconds: 86_400, // 1 day
        },
      }
    );

    await sendTransaction(
      connection,
      [createEpochConfigIx],
      epochConfigCreator.publicKey,
      [epochConfigCreator, createKey]
    );

    console.log(await EpochConfig.fromAccountAddress(connection, epochConfigPda));
  });

  it("Adds an epoch", async () => {
    const epochIndex = await getEpochConfigEpochIndex(connection, epochConfigPda);

    console.log("\nEpoch Index:", Number(epochIndex));
    [epochPda] = getEpochPda({
      epochConfig: epochConfigPda,
      epochIndex: Number(epochIndex),
    });

    const createEpochIx = createAddEpochInstruction(
      {
        deployer: epochConfigCreator.publicKey,
        epochConfig: epochConfigPda,
        epoch: epochPda,
        rentPayer: epochConfigCreator.publicKey,
        systemProgram: SystemProgram.programId,
      },
      {
        args: {
          minimumWitnessesForClaim,
          witnesses: ethWitnesses.map((w) => ({
            address: w.id.toString().toLowerCase(),
            url: w.url,
          })),
        },
      }
    );

    await sendTransaction(connection, [createEpochIx], epochConfigCreator.publicKey, [
      epochConfigCreator,
    ]);

    console.log(await Epoch.fromAccountAddress(connection, epochPda));
  });

  it("Creates a group", async () => {
    [groupPda] = getGroupPda({
      provider: groupProvider,
    });

    const createGroupIx = createCreateGroupInstruction(
      {
        creator: groupCreator.publicKey,
        group: groupPda,
      },
      {
        args: {
          provider: groupProvider,
        },
      }
    );

    await sendTransaction(connection, [createGroupIx], groupCreator.publicKey, [
      groupCreator,
    ]);

    console.log(await Group.fromAccountAddress(connection, groupPda));
  });

  it("Adds a member", async () => {
    const memberAddress = await generateFundedKeypair(connection);

    const claimInfo: ClaimInfo = {
      provider: groupProvider,
      parameters: memberParams,
      contextAddress: memberAddress.publicKey,
      contextMessage: "Application specific context",
    };

    const hashedIdentifier = hashClaimInfo(claimInfo);
    const currentEpochIndex =
      Number(await getEpochConfigEpochIndex(connection, epochConfigPda)) - 1;

    const claimData: CompleteClaimData = {
      identifier: hashedIdentifier,
      owner,
      timestamp: Math.floor(Date.now() / 1000),
      epochIndex: currentEpochIndex,
    };

    const message = [
      claimData.identifier,
      claimData.owner.toLowerCase(),
      claimData.timestamp.toString(),
      claimData.epochIndex.toString(),
    ].join("\n");

    const witnessSignatures = await witnessSelectSignMessage({
      witnesses: ethWitnesses,
      epochIndex: currentEpochIndex,
      identifier: claimData.identifier,
      message,
      minimumWitnessesForClaim,
      timestamp: claimData.timestamp,
    });

    const witnessData = witnessSignatures.map((w) => serializeHash(w));
    const identifierData = serializeHash(claimData.identifier);

    const increaseComputeIx = createComputeLimitAndFeeIx(500_000, 1);
    const addMemberIx = createVerifyProofInstruction(
      {
        epochConfig: epochConfigPda,
        epoch: epochPda,
        signer: memberAddress.publicKey,
      },
      {
        args: {
          claimInfo: {
            contextAddress: claimInfo.contextAddress,
            contextMessage: claimInfo.contextMessage,
            parameters: claimInfo.parameters,
            provider: claimInfo.provider,
          },
          signedClaim: {
            claimData: {
              identifier: identifierData,
              owner,
              epochIndex: claimData.epochIndex,
              timestamp: claimData.timestamp,
            },
            signatures: witnessData,
          },
        },
      }
    );

    await sendTransaction(
      connection,
      [...increaseComputeIx, addMemberIx],
      memberAddress.publicKey,
      [memberAddress]
    );
  });

  it("Fails to add another member due to different provider", async () => {
    const contextAddress = Keypair.generate().publicKey;
    const provider = "provider";
    const parameters = "param";

    const identifier =
      "0xa6db2030140d1a1297ea836cf1fb0a1b467c5c21499dc0cd08dba63d62a6fdcc";
    const timestamp = 1709140768;
    const epochIndex = 1;

    const message = [
      identifier,
      owner.toLowerCase(),
      timestamp.toString(),
      epochIndex.toString(),
    ].join("\n");

    const witnessSignatures = await witnessSelectSignMessage({
      witnesses: ethWitnesses,
      epochIndex,
      identifier,
      message,
      minimumWitnessesForClaim,
      timestamp,
    });

    const witnessData = witnessSignatures.map((w) => serializeHash(w));
    const identifierData = serializeHash(identifier);

    const randomSigner = await generateFundedKeypair(connection);
    const increaseComputeIx = createComputeLimitAndFeeIx(350_000, 1);
    const addMemberIx = createVerifyProofInstruction(
      {
        epochConfig: epochConfigPda,
        epoch: epochPda,
        signer: randomSigner.publicKey,
      },
      {
        args: {
          claimInfo: {
            contextAddress,
            contextMessage: "Application specific context",
            parameters,
            provider: groupProvider,
          },
          signedClaim: {
            claimData: {
              identifier: identifierData,
              owner,
              epochIndex,
              timestamp,
            },
            signatures: witnessData,
          },
        },
      }
    );

    await assert.rejects(() =>
      sendTransaction(
        connection,
        [...increaseComputeIx, addMemberIx],
        randomSigner.publicKey,
        [randomSigner]
      ).catch(translateAndThrowAnchorError)
    );
  });

  it("Creates a dapp", async () => {
    const createKey = Keypair.generate();
    // Dummy groupRoot number.
    const groupRoot = 1234;

    [dappPda] = getDappPda({
      createKey: createKey.publicKey,
      group: groupPda,
    });

    const createDappIx = createCreateDappInstruction(
      {
        createKey: createKey.publicKey,
        creator: dappCreator.publicKey,
        group: groupPda,
        dapp: dappPda,
      },
      {
        args: {
          groupRoot,
        },
      }
    );

    await sendTransaction(connection, [createDappIx], dappCreator.publicKey, [
      dappCreator,
      createKey,
    ]);

    console.log(await Dapp.fromAccountAddress(connection, dappPda));
  });
});
