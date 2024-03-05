use crate::constants::*;
use crate::events::CreateDappEvent;
use crate::state::*;
use crate::utils::fetch_dapp_id;

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateDapp<'info> {
    #[account(
        init,
        payer = creator,
        space = Dapp::size(),
        seeds = [
            SEED_PREFIX,
            SEED_DAPP,
            create_key.key().as_ref(),
            group.key().as_ref()
        ],
        bump
    )]
    pub dapp: Account<'info, Dapp>,

    #[account(
        seeds = [
            SEED_PREFIX,
            SEED_GROUP,
            group.provider.as_bytes(),
        ],
        bump = group.bump
        // TODO: If the below case is true, need to create validation for creator here
    )]
    pub group: Account<'info, Group>,

    pub create_key: Signer<'info>,

    // TODO: Not sure if the dapp creator is required to check with the group creator
    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create(ctx: Context<CreateDapp>, args: CreateDappArgs) -> Result<()> {
    let dapp = &mut ctx.accounts.dapp;
    let creator = &ctx.accounts.creator;

    let group_root = args.group_root;

    let id = fetch_dapp_id(creator.key, group_root)?;

    dapp.set_inner(Dapp {
        bump: ctx.bumps.dapp,
        create_key: ctx.accounts.create_key.key(),
        creator: ctx.accounts.creator.key(),
        group: ctx.accounts.group.key(),
        group_root,
        id,
    });

    dapp.validate()?;

    emit!(CreateDappEvent { id });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateDappArgs {
    // Currently this is a dummy value, just to replicate ethereum's code structure
    group_root: u64,
}
