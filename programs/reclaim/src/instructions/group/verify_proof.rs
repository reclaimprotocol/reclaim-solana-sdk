use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::utils::*;

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(args: VerifyProofArgs)]
pub struct VerifyProof<'info> {
    #[account(
        seeds = [
            SEED_PREFIX,
            epoch_config.key().as_ref(),
            SEED_EPOCH,
            &args.signed_claim.claim_data.epoch_index.to_le_bytes()
        ],
        bump = epoch.bump,
        has_one = epoch_config @ ReclaimError::Unauthorized,
    )]
    pub epoch: Account<'info, Epoch>,

    #[account(
        seeds = [
            SEED_PREFIX,
            SEED_EPOCH_CONFIG,
            epoch_config.create_key.as_ref(),
        ],
        bump = epoch_config.bump,
    )]
    pub epoch_config: Account<'info, EpochConfig>,

    #[account(
        constraint = signer.key().eq(&args.claim_info.context_address) @ ReclaimError::Unauthorized
    )]
    pub signer: Signer<'info>,
}

pub fn verify_proof(ctx: Context<VerifyProof>, args: VerifyProofArgs) -> Result<()> {
    let epoch = &ctx.accounts.epoch;

    let SignedClaim {
        claim_data,
        signatures,
    } = args.signed_claim;

    let received_identifier = append_0x(&hex::encode(claim_data.identifier));
    let expected_identifier = hash_claim_info(&args.claim_info);

    require!(
        received_identifier.eq(&expected_identifier),
        ReclaimError::InvalidIdentifier
    );

    let minimum_witnesses = usize::from(epoch.minimum_witnesses_for_claim);
    let witness_serialized_data = claim_data.serialize_for_witness(minimum_witnesses);

    let hashed_witness_serialized_data = hash_content(&witness_serialized_data);

    let selected_witnesses = select_witness_addresses(
        minimum_witnesses,
        &hashed_witness_serialized_data,
        &epoch.witnesses,
    )?;

    msg!("Selected Witnesses: {:?}", selected_witnesses);

    /* Recovering witnesses from signatures */
    let recovery_serialized_data = claim_data.serialize_for_recovery();
    let hashed_recovery_serialized_data = prepare_for_verification(&recovery_serialized_data);

    let recovered_witnesses =
        recover_witness_addresses(&hashed_recovery_serialized_data, &signatures)?;

    msg!("Recovered Witnesses: {:?}", recovered_witnesses);

    /* Checking selected vs recovered witnesses */
    for recovered_witness in recovered_witnesses {
        require!(
            selected_witnesses.contains(&recovered_witness),
            ReclaimError::InvalidWitnessSignature
        );
    }

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct VerifyProofArgs {
    pub claim_info: ClaimInfo,
    pub signed_claim: SignedClaim,
}
