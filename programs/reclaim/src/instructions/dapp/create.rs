use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateDapp {}

pub fn create(_ctx: Context<CreateDapp>, _args: CreateDappArgs) -> Result<()> {
    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateDappArgs {
    id: u64,
}
