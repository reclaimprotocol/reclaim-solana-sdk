use crate::errors::*;

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
