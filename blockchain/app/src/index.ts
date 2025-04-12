import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { Escrow } from './types/escrow';
import idl from '../target/idl/escrow.json';

export class EscrowClient {
  private program: Program<Escrow>;
  private connection: Connection;
  private wallet: anchor.Wallet;

  constructor(
    connection: Connection,
    wallet: anchor.Wallet,
    programId: PublicKey = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
  ) {
    this.connection = connection;
    this.wallet = wallet;

    // Create the provider
    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    // Create the program
    this.program = new Program(idl as any, programId, provider) as Program<Escrow>;
  }

  /**
   * Initialize a new escrow
   */
  async initializeEscrow(
    amount: number,
    conditions: string,
    depositTokenAccount: PublicKey,
    receiveTokenAccount: PublicKey,
    escrowTokenAccount: PublicKey
  ): Promise<string> {
    // Generate a new keypair for the escrow account
    const escrowAccount = Keypair.generate();

    // Find the escrow authority PDA
    const [escrowAuthority, escrowAuthorityBump] = await PublicKey.findProgramAddress(
      [Buffer.from('escrow'), escrowAccount.publicKey.toBuffer()],
      this.program.programId
    );

    // Initialize the escrow
    const tx = await this.program.methods
      .initializeEscrow(
        new anchor.BN(amount * 1000000000), // Convert SOL to lamports
        conditions
      )
      .accounts({
        initializer: this.wallet.publicKey,
        initializerDepositTokenAccount: depositTokenAccount,
        initializerReceiveTokenAccount: receiveTokenAccount,
        escrow: escrowAccount.publicKey,
        escrowTokenAccount: escrowTokenAccount,
        escrowAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([escrowAccount])
      .rpc();

    console.log('Escrow initialized with transaction signature:', tx);
    return escrowAccount.publicKey.toString();
  }

  /**
   * Cancel an escrow
   */
  async cancelEscrow(
    escrowAccountPubkey: PublicKey,
    depositTokenAccount: PublicKey,
    escrowTokenAccount: PublicKey
  ): Promise<string> {
    // Find the escrow authority PDA
    const [escrowAuthority, escrowAuthorityBump] = await PublicKey.findProgramAddress(
      [Buffer.from('escrow'), escrowAccountPubkey.toBuffer()],
      this.program.programId
    );

    // Cancel the escrow
    const tx = await this.program.methods
      .cancelEscrow()
      .accounts({
        initializer: this.wallet.publicKey,
        initializerDepositTokenAccount: depositTokenAccount,
        escrow: escrowAccountPubkey,
        escrowTokenAccount: escrowTokenAccount,
        escrowAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log('Escrow cancelled with transaction signature:', tx);
    return tx;
  }

  /**
   * Execute an escrow
   */
  async executeEscrow(
    escrowAccountPubkey: PublicKey,
    initializer: PublicKey,
    recipientTokenAccount: PublicKey,
    escrowTokenAccount: PublicKey
  ): Promise<string> {
    // Find the escrow authority PDA
    const [escrowAuthority, escrowAuthorityBump] = await PublicKey.findProgramAddress(
      [Buffer.from('escrow'), escrowAccountPubkey.toBuffer()],
      this.program.programId
    );

    // Execute the escrow
    const tx = await this.program.methods
      .executeEscrow()
      .accounts({
        recipient: this.wallet.publicKey,
        recipientTokenAccount: recipientTokenAccount,
        escrow: escrowAccountPubkey,
        initializer: initializer,
        escrowTokenAccount: escrowTokenAccount,
        escrowAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log('Escrow executed with transaction signature:', tx);
    return tx;
  }

  /**
   * Get escrow account data
   */
  async getEscrowAccount(escrowAccountPubkey: PublicKey): Promise<any> {
    return await this.program.account.escrowAccount.fetch(escrowAccountPubkey);
  }
}

export default EscrowClient;
