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
    pub context_address: Pubkey,
    pub context_message: String,
}

impl ClaimInfo {
    pub fn serialize_for_identifier(&self) -> String {
        let ClaimInfo {
            provider,
            parameters,
            context_address,
            context_message,
        } = self;

        let context = format!(
            "{{\"contextAddress\":\"{}\",\"contextMessage\":\"{}\"}}",
            context_address, context_message
        );

        [provider.to_string(), parameters.to_string(), context].join("\n")
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Clone, Debug)]
pub struct ClaimData {
    pub identifier: [u8; 32],
    pub owner: String,
    pub timestamp: u32,
    pub epoch_index: u32,
}

impl ClaimData {
    pub fn serialize_for_recovery(&self) -> String {
        let ClaimData {
            identifier,
            owner,
            timestamp,
            epoch_index,
        } = self;

        let identifier = append_0x(&hex::encode(identifier));

        [
            identifier,
            owner.to_string().to_lowercase(),
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
