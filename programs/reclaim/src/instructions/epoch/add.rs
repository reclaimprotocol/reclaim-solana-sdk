use crate::constants::*;
use crate::errors::*;
use crate::events::*;
use crate::state::*;

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(args: AddEpochArgs)]
pub struct AddEpoch<'info> {
    pub deployer: Signer<'info>,

    #[account(
        init,
        payer = rent_payer,
        space = Epoch::size(&args.witnesses),
        seeds = [
            SEED_PREFIX,
            epoch_config.key().as_ref(),
            SEED_EPOCH,
            &epoch_config.epoch_index.checked_add(1).unwrap().to_le_bytes()
        ],
        bump,
    )]
    pub epoch: Account<'info, Epoch>,

    #[account(
        mut,
        seeds = [
            SEED_PREFIX,
            SEED_EPOCH_CONFIG,
            deployer.key().as_ref()
        ],
        bump = epoch_config.bump,
        has_one = deployer @ ReclaimError::Unauthorized
    )]
    pub epoch_config: Account<'info, EpochConfig>,

    #[account(mut)]
    pub rent_payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn add(ctx: Context<AddEpoch>, args: AddEpochArgs) -> Result<()> {
    let AddEpochArgs {
        mut witnesses,
        minimum_witnesses_for_claim,
    } = args;

    let epoch_config = &mut ctx.accounts.epoch_config;
    let system_program = &ctx.accounts.system_program;
    let rent_payer = &ctx.accounts.rent_payer;

    // Helpful for binary search later
    witnesses.sort_by_key(|w| w.address);
    witnesses.dedup_by_key(|w| w.address);

    // Epoch mutations
    let epoch_index = epoch_config.epoch_index.checked_add(1).unwrap();
    let current_timestamp = Clock::get()?.unix_timestamp;
    let expiry_timestamp = current_timestamp
        .checked_add(i64::try_from(epoch_config.epoch_duration_seconds).unwrap())
        .unwrap();

    let epoch = &mut ctx.accounts.epoch;
    epoch.set_inner(Epoch {
        bump: ctx.bumps.epoch,
        created_at: current_timestamp,
        expired_at: expiry_timestamp,
        epoch_config: epoch_config.key(),
        index: epoch_index,
        minimum_witnesses_for_claim,
        witnesses: witnesses.clone(),
    });

    epoch.validate()?;

    // Epoch config mutations
    epoch_config.epoch_index = epoch_index;

    match epoch_config.epochs.binary_search(&epoch.key()) {
        Ok(_) => return err!(ReclaimError::EpochAlreadyExists),
        Err(epoch_index) => epoch_config.epochs.insert(epoch_index, epoch.key()),
    }

    EpochConfig::realloc_if_needed(
        epoch_config.to_account_info(),
        &epoch_config.epochs,
        rent_payer.to_account_info(),
        system_program.to_account_info(),
    )?;

    epoch_config.validate()?;

    emit!(AddEpochEvent {
        bump: ctx.bumps.epoch,
        created_at: current_timestamp,
        expired_at: expiry_timestamp,
        epoch_config: epoch_config.key(),
        index: epoch_index,
        minimum_witnesses_for_claim,
        witnesses,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AddEpochArgs {
    pub witnesses: Vec<Witness>,
    pub minimum_witnesses_for_claim: u8,
}
