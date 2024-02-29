use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::*;

#[account]
pub struct Group {
    // Bump for the address
    pub bump: u8,
    // Provider
    pub provider: String,
    // Members of the group
    pub members: Vec<Pubkey>,
}

impl Group {
    pub fn size(members: &[Pubkey]) -> usize {
        8 + // Anchor discriminator
        1 + // Bump
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

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Clone, Debug)]
pub struct ClaimInfo {
    pub provider: String,
    pub parameters: String,
    pub context: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Clone, Debug)]
pub struct ClaimData {
    pub identifier: Vec<Vec<u8>>,
    pub address: Vec<Vec<u8>>,
    pub timestamp: u32,
    pub epoch_index: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Clone, Debug)]
pub struct SignedClaim {
    pub claim_data: ClaimData,
    pub signatures: Vec<Vec<u8>>,
}
