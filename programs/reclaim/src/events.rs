use anchor_lang::prelude::*;

use crate::state::Witness;

#[event]
pub struct AddEpochEvent {
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

#[event]
pub struct CreateGroupEvent {
    // Group ID
    pub id: u32,
    // Group PDA
    pub group_address: Pubkey,
    // Provider
    pub provider: String,
}

#[event]
pub struct CreateDappEvent {
    // Dapp ID
    pub id: u32,
}
