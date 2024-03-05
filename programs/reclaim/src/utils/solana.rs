use crate::errors::*;
use crate::state::*;
use crate::utils::*;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    keccak::hash as keccak_256, secp256k1_recover::secp256k1_recover,
};
use anchor_lang::system_program;

pub fn select_witness_addresses(
    minimum_witnesses: usize,
    hash: &[u8; 32],
    witnesses: &[Witness],
) -> Result<Vec<String>> {
    let mut witnesses_left = witnesses
        .iter()
        .map(|w| w.address.clone())
        .collect::<Vec<String>>();

    let mut selected_witnesses: Vec<String> = vec![];

    let mut byte_offset: u8 = 0;
    for _ in 0..minimum_witnesses {
        let random_seed = fetch_random_seed(hash, byte_offset)?;
        let witness_index = random_seed % witnesses_left.len() as u32;

        let witness = witnesses_left[witness_index as usize].clone();
        selected_witnesses.push(witness);

        witnesses_left[witness_index as usize] =
            witnesses[witnesses_left.len() - 1].address.clone();
        witnesses_left.pop();

        byte_offset = (byte_offset + 4) % u8::try_from(hash.len()).unwrap();
    }

    Ok(selected_witnesses)
}

pub fn recover_witness_addresses(hash: &[u8; 32], signatures: &[[u8; 65]]) -> Result<Vec<String>> {
    let mut recovered_witnesses: Vec<String> = vec![];
    for signature in signatures {
        require!(
            signature[64].checked_sub(27).is_some(),
            ReclaimError::InvalidWitnessSignature
        );

        let recovery_id = signature[64].checked_sub(27).unwrap();
        require!(recovery_id <= 3, ReclaimError::InvalidWitnessSignature);

        let signature_to_recover = signature.get(0..64).unwrap();
        match secp256k1_recover(hash, recovery_id, signature_to_recover) {
            Ok(address) => {
                let hash = keccak_256(&address.to_bytes()).to_bytes();

                require!(
                    hash.get(12..).is_some(),
                    ReclaimError::InvalidWitnessSignature
                );
                let address_bytes = hash.get(12..).unwrap();
                let public_key = append_0x(&hex::encode(address_bytes));
                recovered_witnesses.push(public_key);
            }
            Err(_) => return err!(ReclaimError::InvalidWitnessSignature),
        };
    }

    Ok(recovered_witnesses)
}

pub fn realloc<'info>(
    account: AccountInfo<'info>,
    required_size: usize,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
) -> Result<bool> {
    let account_current_size = account.data.borrow().len();
    let account_current_lamports = account.lamports();

    // Check if we need to reallocate space.
    if account_current_size >= required_size {
        return Ok(false);
    }

    let rent = Rent::get()?;

    // If more lamports are needed, transfer them to the account.
    let required_lamports = rent.minimum_balance(required_size).max(1);

    let lmaports_diff = required_lamports.saturating_sub(account_current_lamports);

    if lmaports_diff > 0 {
        system_program::transfer(
            CpiContext::new(
                system_program,
                system_program::Transfer {
                    from: payer,
                    to: account.clone(),
                },
            ),
            lmaports_diff,
        )?;
    }

    // Reallocate more space.
    msg!("Expanding account's space");
    AccountInfo::realloc(&account, required_size, false)?;

    Ok(true)
}
