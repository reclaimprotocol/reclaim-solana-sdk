use anchor_lang::prelude::*;

use crate::constants::MAX_WITNESS_HOST_SIZE;
use crate::errors::*;

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct Witness {
    pub address: Pubkey,
    pub host: String,
}

#[account]
pub struct Epoch {
    // Bump for the address
    pub bump: u8,
    // Epoch Config
    pub epoch_config: Pubkey,
    // Index
    pub index: u64,
    // Epoch Creation timestamp
    pub created_at: i64,
    // Epoch Expiration timestamp
    pub expired_at: i64,
    // Minimum witnesses for claim
    pub minimum_witnesses_for_claim: u8,
    // Witnesses
    pub witnesses: Vec<Witness>,
}

impl Epoch {
    pub fn size(witnesses: &[Witness]) -> usize {
        let witness_size = 32 + (4 + MAX_WITNESS_HOST_SIZE);
        8 + // Anchor discriminator
        1 + // Bump
        32 + // Epoch Config
        8 + // Index
        8 + // Created At
        8 + // Expired At
        1 + // Minimum Witnesses for Claim
        4 + // Vector discriminator
        (witnesses.len() * witness_size)
    }

    pub fn validate(&self) -> Result<()> {
        let witnesses = &self.witnesses;
        for witness in witnesses {
            if witness.host.len().gt(&MAX_WITNESS_HOST_SIZE) {
                return err!(ReclaimError::HostTooLong);
            }
        }

        if usize::from(self.minimum_witnesses_for_claim) > witnesses.len() {
            return err!(ReclaimError::InvalidWitnessClaimCount);
        }

        Ok(())
    }
}
