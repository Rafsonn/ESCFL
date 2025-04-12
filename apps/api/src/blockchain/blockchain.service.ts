import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

@Injectable()
export class BlockchainService {
  private connection: Connection;

  constructor(private configService: ConfigService) {
    const network = this.configService.get('SOLANA_NETWORK', 'devnet');
    const endpoint = this.configService.get('SOLANA_RPC_ENDPOINT', clusterApiUrl(network));
    this.connection = new Connection(endpoint, 'confirmed');
  }

  getConnection(): Connection {
    return this.connection;
  }

  async getBalance(publicKey: string): Promise<number> {
    try {
      const key = new PublicKey(publicKey);
      const balance = await this.connection.getBalance(key);
      return balance / 1000000000; // Convert lamports to SOL
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async getTransactions(publicKey: string, limit = 10): Promise<any[]> {
    try {
      const key = new PublicKey(publicKey);
      const signatures = await this.connection.getSignaturesForAddress(key, { limit });
      
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature);
          return {
            signature: sig.signature,
            blockTime: sig.blockTime,
            confirmationStatus: sig.confirmationStatus,
            ...tx,
          };
        })
      );
      
      return transactions;
    } catch (error) {
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  async isValidPublicKey(publicKey: string): Promise<boolean> {
    try {
      new PublicKey(publicKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}
