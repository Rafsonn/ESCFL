use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use solana_program::pubkey::Pubkey;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod escrow {
    use super::*;

    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        amount: u64,
        conditions: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let initializer = &ctx.accounts.initializer;
        
        escrow.initializer = initializer.key();
        escrow.initializer_deposit_token_account = ctx.accounts.initializer_deposit_token_account.key();
        escrow.initializer_receive_token_account = ctx.accounts.initializer_receive_token_account.key();
        escrow.amount = amount;
        escrow.conditions = conditions;
        escrow.is_active = true;
        
        // Transfer tokens to the escrow account
        let transfer_instruction = Transfer {
            from: ctx.accounts.initializer_deposit_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: initializer.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );
        
        token::transfer(cpi_ctx, amount)?;
        
        msg!("Escrow initialized successfully");
        Ok(())
    }
    
    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // Verify the escrow is active
        require!(escrow.is_active, EscrowError::EscrowNotActive);
        
        // Verify the initializer is the one cancelling
        require!(
            escrow.initializer == ctx.accounts.initializer.key(),
            EscrowError::InvalidAuthority
        );
        
        // Transfer tokens back to the initializer
        let transfer_instruction = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.initializer_deposit_token_account.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
        };
        
        let seeds = &[
            b"escrow".as_ref(),
            escrow.to_account_info().key.as_ref(),
            &[*ctx.bumps.get("escrow_authority").unwrap()],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        
        token::transfer(cpi_ctx, escrow.amount)?;
        
        // Mark the escrow as inactive
        escrow.is_active = false;
        
        msg!("Escrow cancelled successfully");
        Ok(())
    }
    
    pub fn execute_escrow(ctx: Context<ExecuteEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // Verify the escrow is active
        require!(escrow.is_active, EscrowError::EscrowNotActive);
        
        // Transfer tokens to the recipient
        let transfer_instruction = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
        };
        
        let seeds = &[
            b"escrow".as_ref(),
            escrow.to_account_info().key.as_ref(),
            &[*ctx.bumps.get("escrow_authority").unwrap()],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        
        token::transfer(cpi_ctx, escrow.amount)?;
        
        // Mark the escrow as inactive
        escrow.is_active = false;
        
        msg!("Escrow executed successfully");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(amount: u64, conditions: String)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    
    #[account(
        mut,
        constraint = initializer_deposit_token_account.owner == initializer.key(),
        constraint = initializer_deposit_token_account.amount >= amount
    )]
    pub initializer_deposit_token_account: Account<'info, TokenAccount>,
    
    #[account(
        constraint = initializer_receive_token_account.owner == initializer.key()
    )]
    pub initializer_receive_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = initializer,
        space = 8 + EscrowAccount::LEN
    )]
    pub escrow: Account<'info, EscrowAccount>,
    
    #[account(
        mut,
        constraint = escrow_token_account.mint == initializer_deposit_token_account.mint
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [b"escrow", escrow.key().as_ref()],
        bump
    )]
    /// CHECK: This is a PDA that will be used as the authority for the escrow token account
    pub escrow_authority: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    
    #[account(
        mut,
        constraint = initializer_deposit_token_account.owner == initializer.key()
    )]
    pub initializer_deposit_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = escrow.initializer == initializer.key(),
        constraint = escrow.is_active,
        close = initializer
    )]
    pub escrow: Account<'info, EscrowAccount>,
    
    #[account(
        mut,
        constraint = escrow_token_account.mint == initializer_deposit_token_account.mint
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [b"escrow", escrow.key().as_ref()],
        bump
    )]
    /// CHECK: This is a PDA that will be used as the authority for the escrow token account
    pub escrow_authority: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ExecuteEscrow<'info> {
    #[account(mut)]
    pub recipient: Signer<'info>,
    
    #[account(
        mut,
        constraint = recipient_token_account.owner == recipient.key()
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = escrow.is_active,
        close = initializer
    )]
    pub escrow: Account<'info, EscrowAccount>,
    
    /// CHECK: This is the initializer of the escrow
    #[account(mut)]
    pub initializer: UncheckedAccount<'info>,
    
    #[account(
        mut,
        constraint = escrow_token_account.mint == recipient_token_account.mint
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [b"escrow", escrow.key().as_ref()],
        bump
    )]
    /// CHECK: This is a PDA that will be used as the authority for the escrow token account
    pub escrow_authority: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct EscrowAccount {
    pub initializer: Pubkey,
    pub initializer_deposit_token_account: Pubkey,
    pub initializer_receive_token_account: Pubkey,
    pub amount: u64,
    pub conditions: String,
    pub is_active: bool,
}

impl EscrowAccount {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 200 + 1; // Pubkeys + u64 + String (max 200 chars) + bool
}

#[error_code]
pub enum EscrowError {
    #[msg("Escrow is not active")]
    EscrowNotActive,
    #[msg("Invalid authority for this operation")]
    InvalidAuthority,
}
