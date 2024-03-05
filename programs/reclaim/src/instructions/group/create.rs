use anchor_lang::prelude::*;

use crate::constants::*;
use crate::events::*;
use crate::state::*;
use crate::utils::*;

#[derive(Accounts)]
#[instruction(args: CreateGroupArgs)]
pub struct CreateGroup<'info> {
    #[account(
        init,
        payer = creator,
        space = Group::size(&[]),
        seeds = [
            SEED_PREFIX,
            SEED_GROUP,
            args.provider.as_bytes(),
        ],
        bump
    )]
    pub group: Account<'info, Group>,

    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create(ctx: Context<CreateGroup>, args: CreateGroupArgs) -> Result<()> {
    let group = &mut ctx.accounts.group;
    let creator = &ctx.accounts.creator;

    let id = fetch_group_id(&args.provider)?;

    group.set_inner(Group {
        id,
        bump: ctx.bumps.group,
        creator: creator.key(),
        provider: args.provider.clone(),
        members: vec![],
    });

    group.validate()?;

    emit!(CreateGroupEvent {
        id,
        group_address: group.key(),
        provider: args.provider
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateGroupArgs {
    pub provider: String,
}
