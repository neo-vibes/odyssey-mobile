# AGENTS.md

## Overview

Odyssey Mobile — React Native wallet app for humans to manage AI agent spending sessions on Solana. Create wallet with passkey, approve session requests, monitor activity.

## Quick Start

```bash
npm install
npm start        # Expo dev server
npm test         # Run tests
npm run lint     # Check linting
```

## Project Structure

```
src/
├── types/        # Type definitions (wallet, session, transaction)
├── components/   # UI components
├── hooks/        # Custom hooks (useWallet, useSessions)
├── services/     # API client, passkey, solana
├── screens/      # App screens
├── navigation/   # React Navigation setup
└── utils/        # Helpers, logger, crypto
```

## Key Principles

1. **Verify your work** — Run tests, check against spec
2. **Parse at boundaries** — Zod for API responses
3. **Explicit > implicit** — No magic
4. **Test before done** — No PR without tests
5. **Debug logging** — Log passkey ops, API calls, crypto at debug level

## Quality Standards

- TypeScript strict mode
- ESLint + Prettier
- Tests required, coverage > 80%
- Zod validation at API boundaries

## Code Rules

- **Packages > utils** — Use established packages
- **3 params max** — Use options object
- **Small functions** — One job, max ~30 lines
- **Early returns** — Fail fast
- **No magic values** — Config or constants

## Security Rules

- Never log private keys or secrets
- Validate all server responses
- Use secure storage for credentials
- Passkey private keys never leave device

## Before Completing Any Task

- [ ] Tests pass
- [ ] Lint passes
- [ ] TypeScript passes
- [ ] No console.log (use logger)
- [ ] No any types
- [ ] Security review for sensitive flows

## Don't

- Don't commit without tests
- Don't use any types
- Don't log sensitive data
- Don't hardcode API URLs (use config)
- Don't skip verification checklist

## Lazorkit Mobile SDK

Use `@lazorkit/wallet-mobile-adapter` for passkey wallet.

**Cookbook:** https://github.com/0xharp/lazorkit-cookbook/tree/main/mobile

```tsx
import { useWallet } from '@lazorkit/wallet-mobile-adapter';

const { wallet, isConnected, connect, disconnect } = useWallet();

await connect({
  redirectUrl: Linking.createURL('callback'),
  onSuccess: (w) => console.log(w.smartWallet),
});
```

- Uses deep linking for redirect flow
- `wallet.smartWallet` = Solana address
- Test with both simulator and real device
