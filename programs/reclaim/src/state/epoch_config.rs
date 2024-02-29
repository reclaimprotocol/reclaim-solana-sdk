use crate::{constants::MAX_EPOCHS, errors::ReclaimError};
use anchor_lang::prelude::*;

#[account]
pub struct EpochConfig {
    // Bump for the address
    pub bump: u8,
    // Create key
    pub create_key: Pubkey,
    // Deployer of epoch config
    pub deployer: Pubkey,
    // Duration of each epoch
    pub epoch_duration_seconds: u64,
    // Current Epoch Index
    pub epoch_index: u32,
    // Registered Epochs
    pub epochs: Vec<Pubkey>,
}

impl EpochConfig {
    pub fn size(epochs: &[Pubkey]) -> usize {
        8 + // Anchor discriminator
        1 + // Bump
        32 + // Create key
        32 + // Deployer
        8 + // Epoch Duration Seconds
        4 + // Epoch Index
        4 + // Vector Discriminator
        (epochs.len() * 32) // Epoch addresses
    }

    pub fn validate(&self) -> Result<()> {
        if self.epochs.len().gt(&usize::from(MAX_EPOCHS)) {
            return err!(ReclaimError::MaxEpochLengthReached);
        }
        Ok(())
    }
}
