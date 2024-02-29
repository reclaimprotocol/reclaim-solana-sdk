#![allow(unknown_lints)]
#![allow(ambiguous_glob_reexports)]

use anchor_lang::prelude::*;
use instructions::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

declare_id!("rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf");

#[program]
pub mod reclaim {
    use super::*;

    pub fn initialize_epoch_config(
        ctx: Context<InitializeEpochConfig>,
        args: InitializeEpochConfigArgs,
    ) -> Result<()> {
        epoch::initialize(ctx, args)
    }

    pub fn add_epoch(ctx: Context<AddEpoch>, args: AddEpochArgs) -> Result<()> {
        epoch::add(ctx, args)
    }

    pub fn create_group(ctx: Context<CreateGroup>, args: CreateGroupArgs) -> Result<()> {
        group::create(ctx, args)
    }

    pub fn add_member_group(ctx: Context<AddMemberGroup>, args: AddMemberGroupArgs) -> Result<()> {
        group::add_member(ctx, args)
    }

    pub fn create_dapp(ctx: Context<CreateDapp>, args: CreateDappArgs) -> Result<()> {
        dapp::create(ctx, args)
    }
}
