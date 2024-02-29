use anchor_lang::prelude::*;

use crate::utils::append_0x;

#[derive(AnchorDeserialize, AnchorSerialize, PartialEq, Eq, Clone, Debug)]
pub struct SignedClaim {
    pub claim_data: ClaimData,
    pub signatures: Vec<[u8; 65]>,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Clone, Debug)]
pub struct ClaimInfo {
    pub provider: String,
    pub parameters: String,
    pub context: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Clone, Debug)]
pub struct ClaimData {
    pub identifier: [u8; 32],
    pub signer: Pubkey,
    pub timestamp: u32,
    pub epoch_index: u32,
}

impl ClaimData {
    pub fn serialize_for_recovery(&self) -> String {
        let ClaimData {
            identifier,
            signer,
            timestamp,
            epoch_index,
        } = self;

        let identifier = append_0x(&hex::encode(identifier));

        [
            identifier,
            signer.to_string().to_lowercase(),
            timestamp.to_string(),
            epoch_index.to_string(),
        ]
        .join("\n")
    }

    pub fn serialize_for_witness(&self, epoch_minimum_witness: usize) -> String {
        let ClaimData {
            identifier,
            timestamp,
            epoch_index,
            ..
        } = self;

        let identifier = append_0x(&hex::encode(identifier));

        [
            identifier,
            epoch_index.to_string(),
            epoch_minimum_witness.to_string(),
            timestamp.to_string(),
        ]
        .join("\n")
    }
}
