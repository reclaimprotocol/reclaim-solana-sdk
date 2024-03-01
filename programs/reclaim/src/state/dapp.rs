use anchor_lang::prelude::*;

#[account]
pub struct Dapp {
    // Dapp ID
    pub id: u32,
    // Group Root
    pub group_root: u64,
    // Bump for the address
    pub bump: u8,
    // Create key
    pub create_key: Pubkey,
    // Creator
    pub creator: Pubkey,
    // Group address
    pub group: Pubkey,
}

impl Dapp {
    pub fn size() -> usize {
        8 + // Anchor discriminator
        4 + // Dapp ID
        8 + // Group root
        1 + // Bump
        32 + // Create key
        32 + // Creator
        32 // Group
    }

    pub fn validate(&self) -> Result<()> {
        Ok(())
    }
}
