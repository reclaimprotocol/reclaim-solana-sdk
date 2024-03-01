/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * Arguments used to create {@link Group}
 * @category Accounts
 * @category generated
 */
export type GroupArgs = {
  id: number
  bump: number
  createKey: web3.PublicKey
  creator: web3.PublicKey
  provider: string
  members: web3.PublicKey[]
}

export const groupDiscriminator = [209, 249, 208, 63, 182, 89, 186, 254]
/**
 * Holds the data for the {@link Group} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class Group implements GroupArgs {
  private constructor(
    readonly id: number,
    readonly bump: number,
    readonly createKey: web3.PublicKey,
    readonly creator: web3.PublicKey,
    readonly provider: string,
    readonly members: web3.PublicKey[]
  ) {}

  /**
   * Creates a {@link Group} instance from the provided args.
   */
  static fromArgs(args: GroupArgs) {
    return new Group(
      args.id,
      args.bump,
      args.createKey,
      args.creator,
      args.provider,
      args.members
    )
  }

  /**
   * Deserializes the {@link Group} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [Group, number] {
    return Group.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link Group} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<Group> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find Group account at ${address}`)
    }
    return Group.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, groupBeet)
  }

  /**
   * Deserializes the {@link Group} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [Group, number] {
    return groupBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link Group} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return groupBeet.serialize({
      accountDiscriminator: groupDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link Group} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: GroupArgs) {
    const instance = Group.fromArgs(args)
    return groupBeet.toFixedFromValue({
      accountDiscriminator: groupDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link Group} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: GroupArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      Group.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link Group} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      id: this.id,
      bump: this.bump,
      createKey: this.createKey.toBase58(),
      creator: this.creator.toBase58(),
      provider: this.provider,
      members: this.members,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const groupBeet = new beet.FixableBeetStruct<
  Group,
  GroupArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['id', beet.u32],
    ['bump', beet.u8],
    ['createKey', beetSolana.publicKey],
    ['creator', beetSolana.publicKey],
    ['provider', beet.utf8String],
    ['members', beet.array(beetSolana.publicKey)],
  ],
  Group.fromArgs,
  'Group'
)
