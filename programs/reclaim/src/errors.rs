use anchor_lang::prelude::*;

#[error_code]
pub enum ReclaimError {
    #[msg("Invalid Epoch Duration")]
    InvalidEpochDuration,
    #[msg("Unauthorized Deployer")]
    Unauthorized,
    #[msg("Host length exceeds limit")]
    HostTooLong,
    #[msg("Invalid Witnes Claim count")]
    InvalidWitnessClaimCount,
    #[msg("Epoch already exists")]
    EpochAlreadyExists,
    #[msg("Max Epochs reached")]
    MaxEpochLengthReached,
}
