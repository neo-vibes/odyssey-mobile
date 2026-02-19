# Odyssey Mobile — Spec

> Mobile wallet for humans to manage AI agent spending sessions on Solana.

## Overview

React Native (Expo) app with:
- Passkey wallet creation
- Agent pairing & management
- Session approval & monitoring  
- SOL wallet (balance, deposit, send)

---

## Screens

### 1. Onboarding (first launch only)

**Flow:**
1. Welcome screen with "Create Wallet" button
2. Passkey creation prompt (WebAuthn)
3. Success → navigate to main app

**Acceptance:**
- [ ] Passkey created and stored securely
- [ ] Wallet address derived from passkey
- [ ] Only shown on first launch

---

### 2. Main App (2 tabs + notification center)

**Layout:**
```
┌─────────────────────────────────┐
│  Odyssey                    🔔  │  ← Notification bell (upper right)
├─────────────────────────────────┤
│                                 │
│         [Tab Content]           │
│                                 │
├─────────────────────────────────┤
│    [Agents]      [Wallet]       │  ← Bottom tabs
└─────────────────────────────────┘
```

---

### 3. Agents Tab

**List view:**
- Shows all paired/authorized agents
- Each item: Agent name, status (active sessions count)
- "Add Agent" button (floating or header)

**Actions:**
- Tap agent → Agent Detail screen
- Add agent → Pairing flow
- Swipe/long-press → Revoke agent

**Acceptance:**
- [ ] List all paired agents
- [ ] Show active session count per agent
- [ ] Add new agent via pairing code
- [ ] Revoke agent (removes all sessions)

---

### 4. Agent Detail Screen

**Content:**
- Agent name/ID
- Paired date
- List of sessions (active first, then chronological)

**Session item:**
- Status (active/expired/revoked)
- Spending limit
- Created date
- Amount used

**Actions:**
- Tap session → Session Detail
- Revoke agent button

---

### 5. Session Detail Screen

**Content:**
- Session ID
- Status
- Spending limits (per-tx, total)
- Expiry time
- Amount used / remaining

**Transaction log:**
- List of transactions in this session
- Each: timestamp, amount, destination, status

**Actions:**
- Revoke session (if active)

---

### 6. Wallet Tab

**Content:**
- SOL balance (large, prominent)
- Wallet address (truncated, tap to copy)

**Actions:**
- Deposit → shows full address + QR code
- Send → send SOL flow

**Acceptance:**
- [ ] Show SOL balance from Solana devnet
- [ ] Copy wallet address
- [ ] Deposit: display address + QR
- [ ] Send: amount, destination, confirm with passkey

---

### 7. Notification Center

**Trigger:** Bell icon (upper right)

**Content:**
- List of pending session requests
- Each: "Agent X requests session for Y SOL"
- "Detail" button

**Session Request Detail:**
- Agent name
- Requested limits (per-tx, total, duration)
- Approve / Reject buttons

**Approval flow:**
- Tap Approve → passkey signature
- Success → session created, notification dismissed

**Acceptance:**
- [ ] Show pending session requests
- [ ] Detail view with full request info
- [ ] Approve with passkey signature
- [ ] Reject dismisses request

---

## API Integration

**Base URL:** Configurable (default: `https://api.getodyssey.xyz` or `localhost:3001`)

**Endpoints:**
- `POST /api/pairing/request` — agent initiates pairing
- `GET /api/pairing/{requestId}` — check pairing status
- `POST /api/wallet/create` — create wallet with passkey
- `POST /api/request-session` — agent requests session
- `GET /api/session-details/{requestId}` — session request details
- `POST /api/session/approve` — human approves session
- `POST /api/session/transfer` — transfer SOL (agent uses this)
- `GET /api/wallet/sessions` — list sessions for wallet
- `GET /api/session/{id}/transactions` — tx log for session

---

## Technical

### Stack
- React Native (Expo)
- TypeScript strict
- React Navigation (bottom tabs + stack)
- @solana/web3.js
- react-native-passkeys (or expo-passkeys)
- Zod (API validation)

### State Management
- React Context or Zustand for global state
- React Query for API data

### Security
- Passkey private key never leaves device
- No sensitive data logged
- API responses validated with Zod

---

## Out of Scope (v1)

- Token balances (SOL only)
- Multiple wallets
- Transaction history for wallet (only session tx logs)
- Settings screen
- Push notifications (just in-app notification center)

---

## Success Metrics

1. Can create wallet with passkey
2. Can pair agent via code
3. Can approve session request
4. Can see session transaction log
5. Can deposit/send SOL

---

*Spec version: 1.0 — 2026-02-19*
