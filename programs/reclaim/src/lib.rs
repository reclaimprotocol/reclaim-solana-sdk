use anchor_lang::prelude::*;

declare_id!("rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf");

#[program]
pub mod reclaim {
    use super::*;

    pub fn initialize(_: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
