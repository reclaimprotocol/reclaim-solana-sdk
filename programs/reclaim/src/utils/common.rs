use crate::errors::*;
use crate::state::*;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak::{hash as keccak_256, HASH_BYTES};

pub fn append_0x(content: &str) -> String {
    let mut initializer = String::from("0x");
    initializer.push_str(content);
    initializer
}

pub fn hash_content(content: &str) -> [u8; HASH_BYTES] {
    keccak_256(content.as_bytes()).to_bytes()
}

pub fn hash_claim_info(claim_info: &ClaimInfo) -> String {
    let serialized_claim_info = claim_info.serialize_for_identifier();
    let hash_bytes = hash_content(&serialized_claim_info);
    append_0x(&hex::encode(hash_bytes))
}

pub fn fetch_random_seed(hashed_content: &[u8; 32], offset: u8) -> Result<u32> {
    let offset_usize = usize::from(offset);
    require!(
        offset_usize <= hashed_content.len(),
        ReclaimError::ArithmeticPanic
    );

    match hashed_content[offset_usize..offset_usize + 4].try_into() {
        Ok(subset_hashed_content) => Ok(u32::from_be_bytes(subset_hashed_content)),
        Err(_) => err!(ReclaimError::ArithmeticPanic),
    }
}

pub fn fetch_group_id(provider: &str) -> Result<u32> {
    let hashed_provider = hash_content(provider);
    let hashed_provider_len = hashed_provider.len();
    let offset = hashed_provider_len - 4;

    match hashed_provider[offset..].try_into() {
        Ok(subset_hashed_content) => Ok(u32::from_be_bytes(subset_hashed_content)),
        Err(_) => err!(ReclaimError::ArithmeticPanic),
    }
}

pub fn fetch_dapp_id(creator: &Pubkey, group_root: u64) -> Result<u32> {
    let serialized = format!("{}{}", creator, group_root);
    let hashed_serialized = hash_content(&serialized);
    let offset = hashed_serialized.len() - 4;

    match hashed_serialized[offset..].try_into() {
        Ok(subset_hashed_content) => Ok(u32::from_be_bytes(subset_hashed_content)),
        Err(_) => err!(ReclaimError::ArithmeticPanic),
    }
}
