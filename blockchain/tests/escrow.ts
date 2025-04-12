import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { Escrow } from '../app/src/types/escrow';
import { assert } from 'chai';

describe('escrow', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Escrow as Program<Escrow>;
  const payer = anchor.web3.Keypair.generate();
  
  // Mock users
  const initializer = Keypair.generate();
  const recipient = Keypair.generate();
  
  // Mock token mint
  let mint: Token;
  let initializerTokenAccount: PublicKey;
  let recipientTokenAccount: PublicKey;
  let escrowTokenAccount: PublicKey;
  
  // Mock escrow account
  let escrowAccount: Keypair;
  let escrowAuthority: PublicKey;
  let escrowAuthorityBump: number;
  
  before(async () => {
    // Airdrop SOL to the payer
    const signature = await provider.connection.requestAirdrop(
      payer.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
    
    // Airdrop SOL to the initializer
    const initializerSignature = await provider.connection.requestAirdrop(
      initializer.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(initializerSignature);
    
    // Create a new token mint
    mint = await Token.createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      6,
      TOKEN_PROGRAM_ID
    );
    
    // Create token accounts for the initializer and recipient
    initializerTokenAccount = await mint.createAccount(initializer.publicKey);
    recipientTokenAccount = await mint.createAccount(recipient.publicKey);
    
    // Mint some tokens to the initializer
    await mint.mintTo(
      initializerTokenAccount,
      payer,
      [],
      1000000000 // 1000 tokens
    );
    
    // Create a token account for the escrow
    escrowTokenAccount = await mint.createAccount(initializer.publicKey);
    
    // Generate a new keypair for the escrow account
    escrowAccount = Keypair.generate();
    
    // Find the escrow authority PDA
    [escrowAuthority, escrowAuthorityBump] = await PublicKey.findProgramAddress(
      [Buffer.from('escrow'), escrowAccount.publicKey.toBuffer()],
      program.programId
    );
  });

  it('Initialize escrow', async () => {
    // Initialize the escrow
    await program.methods
      .initializeEscrow(
        new anchor.BN(100000000), // 100 tokens
        'Test escrow conditions'
      )
      .accounts({
        initializer: initializer.publicKey,
        initializerDepositTokenAccount: initializerTokenAccount,
        initializerReceiveTokenAccount: initializerTokenAccount, // Same account for simplicity
        escrow: escrowAccount.publicKey,
        escrowTokenAccount: escrowTokenAccount,
        escrowAuthority: escrowAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([initializer, escrowAccount])
      .rpc();
    
    // Fetch the escrow account data
    const escrowData = await program.account.escrowAccount.fetch(escrowAccount.publicKey);
    
    // Verify the escrow data
    assert.equal(escrowData.initializer.toString(), initializer.publicKey.toString());
    assert.equal(escrowData.initializerDepositTokenAccount.toString(), initializerTokenAccount.toString());
    assert.equal(escrowData.initializerReceiveTokenAccount.toString(), initializerTokenAccount.toString());
    assert.equal(escrowData.amount.toString(), '100000000');
    assert.equal(escrowData.conditions, 'Test escrow conditions');
    assert.equal(escrowData.isActive, true);
  });

  it('Cancel escrow', async () => {
    // Cancel the escrow
    await program.methods
      .cancelEscrow()
      .accounts({
        initializer: initializer.publicKey,
        initializerDepositTokenAccount: initializerTokenAccount,
        escrow: escrowAccount.publicKey,
        escrowTokenAccount: escrowTokenAccount,
        escrowAuthority: escrowAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([initializer])
      .rpc();
    
    // Fetch the escrow account data
    try {
      await program.account.escrowAccount.fetch(escrowAccount.publicKey);
      assert.fail('Escrow account should be closed');
    } catch (error) {
      // Expected error - account closed
    }
  });

  it('Execute escrow', async () => {
    // Re-initialize the escrow for the execute test
    escrowAccount = Keypair.generate();
    
    [escrowAuthority, escrowAuthorityBump] = await PublicKey.findProgramAddress(
      [Buffer.from('escrow'), escrowAccount.publicKey.toBuffer()],
      program.programId
    );
    
    // Create a new escrow token account
    escrowTokenAccount = await mint.createAccount(initializer.publicKey);
    
    // Initialize the escrow
    await program.methods
      .initializeEscrow(
        new anchor.BN(100000000), // 100 tokens
        'Test escrow conditions'
      )
      .accounts({
        initializer: initializer.publicKey,
        initializerDepositTokenAccount: initializerTokenAccount,
        initializerReceiveTokenAccount: initializerTokenAccount,
        escrow: escrowAccount.publicKey,
        escrowTokenAccount: escrowTokenAccount,
        escrowAuthority: escrowAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([initializer, escrowAccount])
      .rpc();
    
    // Execute the escrow
    await program.methods
      .executeEscrow()
      .accounts({
        recipient: recipient.publicKey,
        recipientTokenAccount: recipientTokenAccount,
        escrow: escrowAccount.publicKey,
        initializer: initializer.publicKey,
        escrowTokenAccount: escrowTokenAccount,
        escrowAuthority: escrowAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([recipient])
      .rpc();
    
    // Fetch the escrow account data
    try {
      await program.account.escrowAccount.fetch(escrowAccount.publicKey);
      assert.fail('Escrow account should be closed');
    } catch (error) {
      // Expected error - account closed
    }
    
    // Verify the recipient received the tokens
    const recipientTokenBalance = await provider.connection.getTokenAccountBalance(
      recipientTokenAccount
    );
    assert.equal(recipientTokenBalance.value.uiAmount, 100);
  });
});
