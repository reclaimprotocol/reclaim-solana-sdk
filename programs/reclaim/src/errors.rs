use anchor_lang::prelude::*;

#[error_code]
pub enum ReclaimError {
    #[msg("Invalid Epoch Duration")]
    InvalidEpochDuration,
    #[msg("Invalid Epoch Index")]
    InvalidEpochIndex,
    #[msg("Invalid Witness")]
    InvalidWitness,
    #[msg("Unauthorized address")]
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
    #[msg("Max Witnesses reached")]
    MaxWitnessesReached,
    #[msg("Member already exists")]
    MemberAlreadyExists,
    #[msg("Max Members reached")]
    MaxMembersReached,
    #[msg("Invalid Identifier")]
    InvalidIdentifier,
    #[msg("Invalid Witness Signature")]
    InvalidWitnessSignature,
    #[msg("Arithmetic Error")]
    ArithmeticPanic,
}
