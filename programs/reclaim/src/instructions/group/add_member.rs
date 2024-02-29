use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::utils::*;

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(args: AddMemberGroupArgs)]
pub struct AddMemberGroup<'info> {
    #[account(
        mut,
        seeds = [
            SEED_PREFIX,
            SEED_GROUP,
            group.create_key.as_ref(),
            args.claim_info.provider.as_bytes(),
        ],
        bump = group.bump
    )]
    pub group: Account<'info, Group>,

    #[account(
        seeds = [
            SEED_PREFIX,
            epoch_config.key().as_ref(),
            SEED_EPOCH,
            &args.signed_claim.claim_data.epoch_index.to_le_bytes()
            // TODO: Should ask if we need to validate the claim data's epoch index should match the current epoch_index in epoch_config
            // &epoch_config.epoch_index.to_le_bytes()
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
        constraint = signer.key().eq(&args.signed_claim.claim_data.signer) @ ReclaimError::Unauthorized
    )]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub rent_payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_member(ctx: Context<AddMemberGroup>, args: AddMemberGroupArgs) -> Result<()> {
    let epoch = &ctx.accounts.epoch;
    let rent_payer = &ctx.accounts.rent_payer;
    let system_program = &ctx.accounts.system_program;

    let group = &mut ctx.accounts.group;

    let SignedClaim {
        claim_data,
        signatures,
    } = args.signed_claim;

    let ClaimInfo { context, .. } = args.claim_info;

    match group.members.binary_search(&context) {
        Ok(_) => return err!(ReclaimError::MemberAlreadyExists),
        Err(member_index) => {
            /* Selecting witnesses */
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
            let hashed_recovery_serialized_data =
                prepare_for_verification(&recovery_serialized_data);

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

            group.members.insert(member_index, context);
        }
    }

    /* Reallocating space */
    let required_size = Group::size(&group.members);
    realloc(
        group.to_account_info(),
        required_size,
        rent_payer.to_account_info(),
        system_program.to_account_info(),
    )?;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AddMemberGroupArgs {
    pub claim_info: ClaimInfo,
    pub signed_claim: SignedClaim,
}
