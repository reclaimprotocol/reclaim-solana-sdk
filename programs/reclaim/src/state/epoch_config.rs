use crate::{constants::MAX_EPOCHS, errors::ReclaimError};
use anchor_lang::{prelude::*, system_program};

#[account]
pub struct EpochConfig {
    // Bump for the address
    pub bump: u8,
    // Deployer of epoch config
    pub deployer: Pubkey,
    // Duration of each epoch
    pub epoch_duration_seconds: u64,
    // Current Epoch Index
    pub epoch_index: u64,
    // Registered Epochs
    pub epochs: Vec<Pubkey>,
}

impl EpochConfig {
    pub fn size(epochs: &[Pubkey]) -> usize {
        8 + // Anchor discriminator
        1 + // Bump
        32 + // Deployer
        8 + // Epoch Duration Seconds
        8 + // Epoch Index
        4 + // Vector Discriminator
        (epochs.len() * 32) // Epoch addresses
    }

    pub fn validate(&self) -> Result<()> {
        if self.epochs.len().gt(&usize::from(MAX_EPOCHS)) {
            return err!(ReclaimError::MaxEpochLengthReached);
        }
        Ok(())
    }

    pub fn realloc_if_needed<'info>(
        epoch_config: AccountInfo<'info>,
        epochs: &[Pubkey],
        payer: AccountInfo<'info>,
        system_program: AccountInfo<'info>,
    ) -> Result<bool> {
        let epoch_config_current_size = epoch_config.data.borrow().len();
        let epoch_config_current_lamports = epoch_config.lamports();
        let required_size = EpochConfig::size(epochs);

        // Check if we need to reallocate space.
        if epoch_config_current_size >= required_size {
            return Ok(false);
        }

        let rent = Rent::get()?;

        // If more lamports are needed, transfer them to the account.
        let required_lamports = rent.minimum_balance(required_size).max(1);

        let lmaports_diff = required_lamports.saturating_sub(epoch_config_current_lamports);

        if lmaports_diff > 0 {
            system_program::transfer(
                CpiContext::new(
                    system_program,
                    system_program::Transfer {
                        from: payer,
                        to: epoch_config.clone(),
                    },
                ),
                lmaports_diff,
            )?;
        }

        // Reallocate more space.
        msg!("Expanding epoch_config's space");
        AccountInfo::realloc(&epoch_config, required_size, false)?;

        Ok(true)
    }
}
