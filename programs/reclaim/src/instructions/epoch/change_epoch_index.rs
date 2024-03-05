use crate::constants::*;
use crate::errors::*;
use crate::state::*;

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ChangeEpochIndexEpochConfig<'info> {
    #[account(
        mut,
        seeds = [
            SEED_PREFIX,
            SEED_EPOCH_CONFIG,
            epoch_config.create_key.key().as_ref()
        ],
        bump,
        has_one = deployer @ ReclaimError::Unauthorized,
    )]
    pub epoch_config: Account<'info, EpochConfig>,

    #[account(mut)]
    pub deployer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn change_epoch_index(
    ctx: Context<ChangeEpochIndexEpochConfig>,
    args: ChangeEpochIndexEpochConfigArgs,
) -> Result<()> {
    let epoch_config = &mut ctx.accounts.epoch_config;

    require!(
        args.new_epoch_index > epoch_config.epoch_index,
        ReclaimError::InvalidEpochIndex
    );

    epoch_config.epoch_index = args.new_epoch_index;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ChangeEpochIndexEpochConfigArgs {
    pub new_epoch_index: u32,
}
