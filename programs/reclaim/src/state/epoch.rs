use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::*;
use crate::utils::is_valid_ethereum_address;

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct Witness {
    pub address: String,
    pub host: String,
}

#[account]
pub struct Epoch {
    // Bump for the address
    pub bump: u8,
    // Epoch Config
    pub epoch_config: Pubkey,
    // Index
    pub index: u32,
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
        let witness_size = (4 + MAX_WITNESS_ADDRESS_SIZE) + (4 + MAX_WITNESS_HOST_SIZE);
        8 + // Anchor discriminator
        1 + // Bump
        32 + // Epoch Config
        4 + // Index
        8 + // Created At
        8 + // Expired At
        1 + // Minimum Witnesses for Claim
        4 + // Vector discriminator
        (witnesses.len() * witness_size)
    }

    pub fn validate(&self) -> Result<()> {
        let witnesses = &self.witnesses;
        if witnesses.len().gt(&usize::from(MAX_WITNESSES)) {
            return err!(ReclaimError::MaxWitnessesReached);
        }

        for witness in witnesses {
            if !is_valid_ethereum_address(&witness.address) {
                return err!(ReclaimError::InvalidWitness);
            }

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
