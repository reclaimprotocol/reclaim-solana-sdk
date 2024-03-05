use anchor_lang::prelude::*;

/* Region init_airdrop */
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitAirdropArgs {
    pub mint_amount: u64,
}
/* */

/* Region claim_airdrop */
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ClaimAirdropArgs {
    pub claim_info: ClaimInfo,
    pub signed_claim: SignedClaim,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SignedClaim {
    pub claim_data: ClaimData,
    pub signatures: Vec<[u8; 65]>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ClaimInfo {
    pub provider: String,
    pub parameters: String,
    pub context_address: Pubkey,
    pub context_message: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ClaimData {
    pub identifier: [u8; 32],
    pub owner: String,
    pub timestamp: u32,
    pub epoch_index: u32,
}
/* endregion */
