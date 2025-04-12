// User types
export interface User {
  id: string;
  email?: string;
  username?: string;
  walletAddress?: string;
  isWalletVerified: boolean;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateDto {
  email?: string;
  username?: string;
  password?: string;
  walletAddress?: string;
}

export interface UserUpdateDto {
  email?: string;
  username?: string;
  password?: string;
  walletAddress?: string;
  avatarUrl?: string;
}

// Authentication types
export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginDto {
  email?: string;
  password?: string;
  walletAddress?: string;
  signature?: string;
}

// Chat types
export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  participants?: ChatRoomParticipant[];
  messages?: Message[];
}

export interface ChatRoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  user?: User;
  joinedAt: Date;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageDto {
  roomId: string;
  content: string;
}

// Escrow types
export interface EscrowTransaction {
  id: string;
  escrowId: string;
  senderId: string;
  sender?: User;
  recipientId?: string;
  recipient?: User;
  recipientWalletAddress?: string;
  amount: number;
  conditions?: string;
  status: EscrowStatus;
  transactionSignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EscrowStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface CreateEscrowDto {
  recipientId?: string;
  recipientWalletAddress?: string;
  amount: number;
  conditions?: string;
}

// Search types
export interface SearchResult<T> {
  item: T;
  score: number;
}

export interface SearchQuery {
  query: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Blockchain types
export interface SolanaTransaction {
  signature: string;
  blockTime?: number;
  confirmationStatus?: string;
  slot?: number;
  meta?: any;
  transaction?: any;
}

export interface TokenBalance {
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}
