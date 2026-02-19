import { z } from 'zod';

// ============================================================================
// Wallet Types
// ============================================================================

export const WalletSchema = z.object({
  publicKey: z.string(),
  createdAt: z.number(),
  name: z.string().optional(),
});

export type Wallet = z.infer<typeof WalletSchema>;

export const StoredWalletSchema = z.object({
  wallet: WalletSchema,
  credentialId: z.string(),
});

export type StoredWallet = z.infer<typeof StoredWalletSchema>;

// ============================================================================
// Agent Types
// ============================================================================

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  pairedAt: z.number(),
  lastSeen: z.number().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
});

export type Agent = z.infer<typeof AgentSchema>;

export const PairingRequestSchema = z.object({
  requestId: z.string(),
  code: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  createdAt: z.number(),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
});

export type PairingRequest = z.infer<typeof PairingRequestSchema>;

// ============================================================================
// Session Types
// ============================================================================

export const SpendingLimitSchema = z.object({
  mint: z.string(), // 'native' for SOL or token mint address
  amount: z.number(),
  decimals: z.number(),
  symbol: z.string().optional(),
});

export type SpendingLimit = z.infer<typeof SpendingLimitSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  walletPubkey: z.string(),
  sessionPubkey: z.string(),
  limits: z.array(SpendingLimitSchema),
  durationSeconds: z.number(),
  createdAt: z.number(),
  expiresAt: z.number(),
  status: z.enum(['pending', 'active', 'expired', 'revoked']),
  spent: z.array(SpendingLimitSchema).optional(),
});

export type Session = z.infer<typeof SessionSchema>;

export const SessionRequestSchema = z.object({
  requestId: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  walletPubkey: z.string(),
  sessionPubkey: z.string(),
  limits: z.array(SpendingLimitSchema),
  durationSeconds: z.number(),
  createdAt: z.number(),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
});

export type SessionRequest = z.infer<typeof SessionRequestSchema>;

// ============================================================================
// Transaction Types
// ============================================================================

export const TransactionSchema = z.object({
  signature: z.string(),
  type: z.enum(['transfer', 'token_transfer', 'other']),
  from: z.string(),
  to: z.string(),
  amount: z.number(),
  mint: z.string().optional(), // For token transfers
  symbol: z.string().optional(),
  timestamp: z.number(),
  status: z.enum(['pending', 'confirmed', 'failed']),
  sessionId: z.string().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// ============================================================================
// Token Types
// ============================================================================

export const TokenBalanceSchema = z.object({
  mint: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  balance: z.number(),
  uiBalance: z.string(),
  logoUri: z.string().optional(),
});

export type TokenBalance = z.infer<typeof TokenBalanceSchema>;

// ============================================================================
// API Response Types
// ============================================================================

export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const PairingResponseSchema = z.object({
  requestId: z.string(),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
  walletPubkey: z.string().optional(),
  authSecret: z.string().optional(),
});

export type PairingResponse = z.infer<typeof PairingResponseSchema>;

export const SessionResponseSchema = z.object({
  requestId: z.string(),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
  session: SessionSchema.optional(),
});

export type SessionResponse = z.infer<typeof SessionResponseSchema>;

export const TransferResponseSchema = z.object({
  signature: z.string(),
  status: z.enum(['pending', 'confirmed', 'failed']),
});

export type TransferResponse = z.infer<typeof TransferResponseSchema>;

// ============================================================================
// Navigation Types
// ============================================================================

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  AgentDetail: { agentId: string };
  SessionDetail: { sessionId: string; agentId: string };
  Send: { tokenMint?: string };
  Receive: undefined;
  PairAgent: undefined;
  ApproveSession: { requestId: string };
};

export type MainTabParamList = {
  Wallet: undefined;
  Agents: undefined;
  Settings: undefined;
};

// ============================================================================
// Store Types
// ============================================================================

export interface WalletState {
  wallet: StoredWallet | null;
  solBalance: number;
  tokens: TokenBalance[];
  isLoading: boolean;
  error: string | null;
}

export interface AgentState {
  agents: Agent[];
  pairingRequests: PairingRequest[];
  sessionRequests: SessionRequest[];
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
}
