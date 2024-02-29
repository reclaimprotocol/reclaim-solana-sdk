use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::*;

#[account]
pub struct Group {
    // Bump for the address
    pub bump: u8,
    // Create key
    pub create_key: Pubkey,
    // Creator
    pub creator: Pubkey,
    // Provider
    pub provider: String,
    // Members of the group
    pub members: Vec<Pubkey>,
}

impl Group {
    pub fn size(members: &[Pubkey]) -> usize {
        8 + // Anchor discriminator
        1 + // Bump
        32 + // Create key
        32 + // Creator
        4 + // String discriminator
        MAX_GROUP_PROVIDER_SIZE +
        4 + // Vector discriminator
        (members.len() * 32)
    }

    pub fn validate(&self) -> Result<()> {
        if self.provider.len() > MAX_GROUP_PROVIDER_SIZE {
            return err!(ReclaimError::ProviderTooLong);
        }
        Ok(())
    }
}
