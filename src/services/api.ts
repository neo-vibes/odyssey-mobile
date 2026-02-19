import {
  PairingResponseSchema,
  SessionResponseSchema,
  TransferResponseSchema,
  SpendingLimit,
  ApiError,
  PairingResponse,
  SessionResponse,
  TransferResponse,
} from '../types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================================
// HTTP Client
// ============================================================================

interface RequestOptions {
  method: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    method: options.method,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  return schema.parse(data);
}

// ============================================================================
// Pairing API
// ============================================================================

export interface PairingRequestParams {
  code: string;
  agentId: string;
  agentName: string;
}

export async function createPairingRequest(params: PairingRequestParams): Promise<PairingResponse> {
  return request(
    '/api/pairing/request',
    {
      method: 'POST',
      body: params,
    },
    PairingResponseSchema
  );
}

export async function checkPairingStatus(requestId: string): Promise<PairingResponse> {
  return request(`/api/pairing/${requestId}`, { method: 'GET' }, PairingResponseSchema);
}

// ============================================================================
// Session API
// ============================================================================

export interface SessionRequestParams {
  agentId: string;
  agentName: string;
  walletPubkey: string;
  sessionPubkey: string;
  durationSeconds: number;
  signature: string;
  timestamp: number;
  authSecret: string;
  limits: SpendingLimit[];
}

export async function createSessionRequest(params: SessionRequestParams): Promise<SessionResponse> {
  return request(
    '/api/request-session',
    {
      method: 'POST',
      body: params,
    },
    SessionResponseSchema
  );
}

export async function checkSessionStatus(requestId: string): Promise<SessionResponse> {
  return request(`/api/session-details/${requestId}`, { method: 'GET' }, SessionResponseSchema);
}

// ============================================================================
// Transfer API
// ============================================================================

export interface TransferParams {
  walletPubkey: string;
  sessionPubkey: string;
  sessionSecretKey: string;
  destination: string;
  amountSol: number;
}

export async function transferSol(params: TransferParams): Promise<TransferResponse> {
  return request(
    '/api/session/transfer',
    {
      method: 'POST',
      body: params,
    },
    TransferResponseSchema
  );
}

export interface TokenTransferParams {
  walletPubkey: string;
  sessionPubkey: string;
  sessionSecretKey: string;
  destination: string;
  mint: string;
  amount: number; // In base units
}

export async function transferToken(params: TokenTransferParams): Promise<TransferResponse> {
  return request(
    '/api/session/transfer-token',
    {
      method: 'POST',
      body: params,
    },
    TransferResponseSchema
  );
}

export interface SignAndSendParams {
  transaction: string; // Base64 encoded
  sessionSecretKey: string;
  sessionPubkey: string;
}

export async function signAndSend(params: SignAndSendParams): Promise<TransferResponse> {
  return request(
    '/api/session/sign-and-send',
    {
      method: 'POST',
      body: params,
    },
    TransferResponseSchema
  );
}

// ============================================================================
// Export all
// ============================================================================

export const api = {
  pairing: {
    create: createPairingRequest,
    check: checkPairingStatus,
  },
  session: {
    request: createSessionRequest,
    check: checkSessionStatus,
  },
  transfer: {
    sol: transferSol,
    token: transferToken,
    signAndSend,
  },
};

export default api;
