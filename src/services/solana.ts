import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { TokenBalance } from '../types';

// ============================================================================
// Configuration
// ============================================================================

const RPC_URL = process.env.EXPO_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
const NETWORK = process.env.EXPO_PUBLIC_NETWORK || 'devnet';

// Known token mints (devnet)
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number }> = {
  // Add known devnet tokens here
};

// ============================================================================
// Connection
// ============================================================================

let connection: Connection | null = null;

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_URL, 'confirmed');
  }
  return connection;
}

export function getNetwork(): string {
  return NETWORK;
}

// ============================================================================
// Balance Functions
// ============================================================================

export async function getSolBalance(publicKey: string): Promise<number> {
  const conn = getConnection();
  const pubkey = new PublicKey(publicKey);
  const balance = await conn.getBalance(pubkey);
  return balance / LAMPORTS_PER_SOL;
}

export async function getTokenBalances(publicKey: string): Promise<TokenBalance[]> {
  const conn = getConnection();
  const pubkey = new PublicKey(publicKey);

  const tokenAccounts = await conn.getParsedTokenAccountsByOwner(pubkey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  });

  const balances: TokenBalance[] = [];

  for (const { account } of tokenAccounts.value) {
    const parsed = account.data.parsed;
    const info = parsed.info;
    const mint = info.mint;
    const balance = info.tokenAmount.uiAmount || 0;
    const decimals = info.tokenAmount.decimals;

    const known = KNOWN_TOKENS[mint];

    balances.push({
      mint,
      symbol: known?.symbol || 'UNKNOWN',
      name: known?.name || 'Unknown Token',
      decimals,
      balance: info.tokenAmount.amount,
      uiBalance: balance.toString(),
      logoUri: undefined,
    });
  }

  return balances;
}

// ============================================================================
// Transaction Building
// ============================================================================

export interface TransferSolParams {
  from: string;
  to: string;
  amountSol: number;
}

export async function buildTransferSolTransaction(
  params: TransferSolParams
): Promise<Transaction> {
  const conn = getConnection();
  const fromPubkey = new PublicKey(params.from);
  const toPubkey = new PublicKey(params.to);
  const lamports = Math.round(params.amountSol * LAMPORTS_PER_SOL);

  const instruction = SystemProgram.transfer({
    fromPubkey,
    toPubkey,
    lamports,
  });

  const transaction = new Transaction().add(instruction);
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = fromPubkey;

  return transaction;
}

export interface TransferTokenParams {
  from: string;
  to: string;
  mint: string;
  amount: number; // In base units
}

export async function buildTransferTokenTransaction(
  _params: TransferTokenParams
): Promise<Transaction> {
  // This requires @solana/spl-token for full implementation
  // For now, return a placeholder that would be replaced with actual SPL transfer
  const transaction = new Transaction();
  const conn = getConnection();
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  // TODO: Add actual SPL token transfer instruction
  // This requires finding/creating associated token accounts

  return transaction;
}

// ============================================================================
// Transaction Utilities
// ============================================================================

export async function getRecentBlockhash(): Promise<{
  blockhash: string;
  lastValidBlockHeight: number;
}> {
  const conn = getConnection();
  return conn.getLatestBlockhash();
}

export async function sendTransaction(signedTransaction: Transaction): Promise<string> {
  const conn = getConnection();
  const signature = await conn.sendRawTransaction(signedTransaction.serialize());
  return signature;
}

export async function confirmTransaction(signature: string): Promise<boolean> {
  const conn = getConnection();
  const result = await conn.confirmTransaction(signature, 'confirmed');
  return !result.value.err;
}

export async function getTransactionStatus(
  signature: string
): Promise<'pending' | 'confirmed' | 'failed'> {
  const conn = getConnection();
  const status = await conn.getSignatureStatus(signature);

  if (!status.value) {
    return 'pending';
  }

  if (status.value.err) {
    return 'failed';
  }

  if (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized') {
    return 'confirmed';
  }

  return 'pending';
}

// ============================================================================
// Address Utilities
// ============================================================================

export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// ============================================================================
// Export all
// ============================================================================

export const solana = {
  getConnection,
  getNetwork,
  getSolBalance,
  getTokenBalances,
  buildTransferSolTransaction,
  buildTransferTokenTransaction,
  getRecentBlockhash,
  sendTransaction,
  confirmTransaction,
  getTransactionStatus,
  isValidAddress,
  shortenAddress,
};

export default solana;
