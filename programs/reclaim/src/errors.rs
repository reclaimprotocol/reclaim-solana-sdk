use anchor_lang::prelude::*;

#[error_code]
pub enum ReclaimError {
    #[msg("Invalid Epoch Duration")]
    InvalidEpochDuration,
    #[msg("Unauthorized Deployer")]
    Unauthorized,
    #[msg("Host length exceeds limit")]
    HostTooLong,
    #[msg("Provider length exceeds limit")]
    ProviderTooLong,
    #[msg("Invalid Witnes Claim count")]
    InvalidWitnessClaimCount,
    #[msg("Epoch already exists")]
    EpochAlreadyExists,
    #[msg("Max Epochs reached")]
    MaxEpochLengthReached,
    #[msg("Member already exists")]
    MemberAlreadyExists,
}
