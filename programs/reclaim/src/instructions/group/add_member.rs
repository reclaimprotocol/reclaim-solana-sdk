use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct AddMemberGroup {}

pub fn add_member(ctx: Context<AddMemberGroup>, args: AddMemberGroupArgs) -> Result<()> {
    // let proof = args.proof;
    // msg!("Proof Claim Info: {:?}", proof.claim_info);
    // msg!("Proof Signed Claim: {:?}", proof.signed_claim);

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AddMemberGroupArgs {
    pub claim_info: ClaimInfo,
    pub signed_claim: SignedClaim,
}
