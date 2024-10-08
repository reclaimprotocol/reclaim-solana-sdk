/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  AddMemberGroupArgs,
  addMemberGroupArgsBeet,
} from '../types/AddMemberGroupArgs'

/**
 * @category Instructions
 * @category AddMemberGroup
 * @category generated
 */
export type AddMemberGroupInstructionArgs = {
  args: AddMemberGroupArgs
}
/**
 * @category Instructions
 * @category AddMemberGroup
 * @category generated
 */
export const addMemberGroupStruct = new beet.FixableBeetArgsStruct<
  AddMemberGroupInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', addMemberGroupArgsBeet],
  ],
  'AddMemberGroupInstructionArgs'
)
/**
 * Accounts required by the _addMemberGroup_ instruction
 *
 * @property [_writable_] group
 * @property [] epoch
 * @property [] epochConfig
 * @property [**signer**] signer
 * @property [_writable_, **signer**] rentPayer
 * @category Instructions
 * @category AddMemberGroup
 * @category generated
 */
export type AddMemberGroupInstructionAccounts = {
  group: web3.PublicKey
  epoch: web3.PublicKey
  epochConfig: web3.PublicKey
  signer: web3.PublicKey
  rentPayer: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const addMemberGroupInstructionDiscriminator = [
  19, 208, 234, 206, 11, 74, 237, 172,
]

/**
 * Creates a _AddMemberGroup_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category AddMemberGroup
 * @category generated
 */
export function createAddMemberGroupInstruction(
  accounts: AddMemberGroupInstructionAccounts,
  args: AddMemberGroupInstructionArgs,
  programId = new web3.PublicKey('rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf')
) {
  const [data] = addMemberGroupStruct.serialize({
    instructionDiscriminator: addMemberGroupInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.group,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.epoch,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.epochConfig,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.signer,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.rentPayer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
