use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::*;

/* Reclaim program imports */
use reclaim::cpi::accounts::VerifyProof;
use reclaim::cpi::verify_proof;
use reclaim::instructions::VerifyProofArgs;
use reclaim::program::Reclaim;
use reclaim::state::ClaimData as ReclaimClaimData;
use reclaim::state::ClaimInfo as ReclaimClaimInfo;
use reclaim::state::SignedClaim as ReclaimSignedClaim;
use reclaim::state::{Epoch, EpochConfig};

/* Airdrop program imports */
use args::*;

declare_id!("ArdPv6gtzY8HQuxzVQbZ8GHMRUatySoUv8jZH4vFj4Tm");

pub mod args;

#[program]
pub mod airdrop {

    use std::ops::Mul;

    use super::*;

    pub fn init_airdrop(ctx: Context<InitAirdrop>, args: InitAirdropArgs) -> Result<()> {
        let signer = &ctx.accounts.signer;
        let mint = &ctx.accounts.mint;
        let manager_token_account = &ctx.accounts.manager_token_account;
        let token_program = &ctx.accounts.token_program;

        let airdrop = &mut ctx.accounts.airdrop;

        /* region Minting tokens to PDA (Manager) */
        let mint_amount = args.mint_amount.mul(10u64.pow(mint.decimals.into()));

        mint_to(
            CpiContext::new(
                token_program.to_account_info(),
                MintTo {
                    authority: signer.to_account_info(),
                    mint: mint.to_account_info(),
                    to: manager_token_account.to_account_info(),
                },
            ),
            mint_amount,
        )?;
        /* endregion */

        airdrop.set_inner(Airdrop {
            bump: ctx.bumps.airdrop,
            mint: mint.key(),
            manager_token_account: manager_token_account.key(),
            tokens_remaining: mint_amount,
        });

        Ok(())
    }

    pub fn claim_airdrop<'info>(
        ctx: Context<'_, '_, '_, 'info, ClaimAirdrop<'info>>,
        args: ClaimAirdropArgs,
    ) -> Result<()> {
        /* region Reclaim proof verification */
        let ClaimAirdropArgs {
            claim_info,
            signed_claim,
        } = args;

        // Signer and rent payer
        let signer_account_info = ctx.accounts.signer.to_account_info();
        // Program Account infos
        let reclaim_program_info = ctx.accounts.reclaim_program.to_account_info();

        // Proof verification
        let epoch_config_account_info = ctx.accounts.epoch_config.to_account_info();
        let epoch_account_info = ctx.accounts.epoch.to_account_info();

        verify_proof(
            CpiContext::new(
                reclaim_program_info,
                VerifyProof {
                    epoch_config: epoch_config_account_info,
                    epoch: epoch_account_info,
                    signer: signer_account_info,
                },
            ),
            VerifyProofArgs {
                claim_info: ReclaimClaimInfo {
                    parameters: claim_info.parameters,
                    context_message: claim_info.context_message,
                    provider: claim_info.provider,
                    context_address: claim_info.context_address,
                },
                signed_claim: ReclaimSignedClaim {
                    claim_data: ReclaimClaimData {
                        epoch_index: signed_claim.claim_data.epoch_index,
                        timestamp: signed_claim.claim_data.timestamp,
                        identifier: signed_claim.claim_data.identifier,
                        owner: signed_claim.claim_data.owner,
                    },
                    signatures: signed_claim.signatures,
                },
            },
        )?;
        /* endregion */

        /* region claiming airdrop */
        let airdrop = &mut ctx.accounts.airdrop;
        let mint = &ctx.accounts.mint;
        let manager_token_account = &ctx.accounts.manager_token_account;
        let signer_token_account = &ctx.accounts.signer_token_account;
        let token_program = &ctx.accounts.token_program;

        let decimals = mint.decimals;
        let transfer_amount = 10u64.mul(10u64.pow(decimals.into()));

        let signer_seeds: &[&[&[u8]]] = &[&[b"airdrop_manager".as_ref(), &[airdrop.bump]]];

        transfer_checked(
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                TransferChecked {
                    mint: mint.to_account_info(),
                    authority: airdrop.to_account_info(),
                    from: manager_token_account.to_account_info(),
                    to: signer_token_account.to_account_info(),
                },
                signer_seeds,
            ),
            transfer_amount,
            decimals,
        )?;

        msg!("Successfully claimed 10 tokens!");
        airdrop.tokens_remaining -= transfer_amount;
        msg!("Tokens remaining: {}", airdrop.tokens_remaining);
        /* endregion */
        Ok(())
    }
}

/* region init_airdrop */
#[account]
pub struct Airdrop {
    pub bump: u8,
    pub mint: Pubkey,
    pub manager_token_account: Pubkey,
    pub tokens_remaining: u64,
}

#[derive(Accounts)]
pub struct InitAirdrop<'info> {
    #[account(
        init,
        space = 8 + 1 + 32 + 32 + 8,
        payer = signer,
        seeds = [b"airdrop_manager"], 
        bump
    )]
    pub airdrop: Account<'info, Airdrop>,

    #[account(
        init,
        payer = signer,
        mint::decimals = 9,
        mint::authority = signer,
        mint::freeze_authority = signer,
        mint::token_program = token_program
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = airdrop,
        associated_token::token_program = token_program,
    )]
    pub manager_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}
/* endregion */

/* region airdrop_verify */
#[derive(Accounts)]
pub struct ClaimAirdrop<'info> {
    /* Address who requested the proof */
    #[account(mut)]
    pub signer: Signer<'info>,
    /* */

    /* Airdrop program required accounts */
    #[account(
        mut,
        seeds = [b"airdrop_manager"],
        bump = airdrop.bump,
        has_one = mint,
        has_one = manager_token_account,
    )]
    pub airdrop: Account<'info, Airdrop>,
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub manager_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub signer_token_account: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    /* */

    /* Reclaim program required accounts */
    pub epoch_config: Account<'info, EpochConfig>,
    pub epoch: Account<'info, Epoch>,
    pub reclaim_program: Program<'info, Reclaim>,
    pub system_program: Program<'info, System>,
    /* */
}
/* endregion */
