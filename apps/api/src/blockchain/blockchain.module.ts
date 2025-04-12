import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { EscrowService } from './escrow/escrow.service';
import { WalletService } from './wallet/wallet.service';

@Module({
  imports: [ConfigModule],
  controllers: [BlockchainController],
  providers: [BlockchainService, EscrowService, WalletService],
  exports: [BlockchainService, EscrowService, WalletService],
})
export class BlockchainModule {}
