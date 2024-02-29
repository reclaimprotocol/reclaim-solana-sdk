use crate::utils::*;

use anchor_lang::solana_program::keccak::HASH_BYTES;

pub fn is_valid_ethereum_address(address: &str) -> bool {
    if address.len() != 42 {
        return false;
    }

    if !address.starts_with("0x") {
        return false;
    }

    if !address[2..].chars().all(|c| c.is_ascii_hexdigit()) {
        return false;
    }

    true
}

pub fn prepare_for_verification(content: &str) -> [u8; HASH_BYTES] {
    let message_check = [
        "\x19Ethereum Signed Message:\n",
        &content.len().to_string(),
        content,
    ]
    .join("");

    hash_content(&message_check)
}
