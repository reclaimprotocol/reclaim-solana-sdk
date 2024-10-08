/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { ClaimInfo, claimInfoBeet } from './ClaimInfo'
import { SignedClaim, signedClaimBeet } from './SignedClaim'
export type VerifyProofArgs = {
  claimInfo: ClaimInfo
  signedClaim: SignedClaim
}

/**
 * @category userTypes
 * @category generated
 */
export const verifyProofArgsBeet =
  new beet.FixableBeetArgsStruct<VerifyProofArgs>(
    [
      ['claimInfo', claimInfoBeet],
      ['signedClaim', signedClaimBeet],
    ],
    'VerifyProofArgs'
  )
