use anchor_lang::prelude::*;

declare_id!("HPHX51Lt497k57RoegWnzhg2Spvaui4kc93dDFwhpbwP");

#[program]
pub mod reclaim {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
