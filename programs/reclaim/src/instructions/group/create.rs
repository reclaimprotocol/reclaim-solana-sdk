use anchor_lang::prelude::*;

use crate::constants::*;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(args: CreateGroupArgs)]
pub struct CreateGroup<'info> {
    #[account(
        init,
        payer = administrator,
        space = Group::size(&[]),
        seeds = [
            SEED_PREFIX,
            SEED_GROUP,
            args.provider.as_bytes(),
            administrator.key().as_ref()
        ],
        bump
    )]
    pub group: Account<'info, Group>,

    // TODO: Not sure if the administrator is the one who created the epoch config. If yes, need to create that binding here.
    #[account(mut)]
    pub administrator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create(ctx: Context<CreateGroup>, args: CreateGroupArgs) -> Result<()> {
    let group = &mut ctx.accounts.group;
    group.set_inner(Group {
        bump: ctx.bumps.group,
        provider: args.provider.clone(),
        members: vec![],
    });

    group.validate()?;

    emit!(CreateGroupEvent {
        group_id: group.key(),
        provider: args.provider
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateGroupArgs {
    pub provider: String,
}
