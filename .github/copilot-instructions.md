# Copilot Instructions for Devnet-to-Mainnet-Bridge

## Project Overview

This is a satirical web application that presents a "Devnet to Mainnet Bridge" interface for Solana. It's a Next.js application that humorously offers to convert Solana Devnet SOL to Mainnet SOL at an absurd exchange rate. The application is primarily for entertainment and educational purposes.

## Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript (strict mode enabled)
- **UI Framework**: React 19.1.0
- **Styling**: TailwindCSS 4
- **Animation**: Framer Motion 12
- **Blockchain**: Solana Web3.js with Wallet Adapter
- **Notifications**: React Hot Toast
- **Analytics**: Vercel Analytics & Speed Insights

## Code Style and Conventions

### General Guidelines

- Use TypeScript with strict mode enabled
- Follow functional component patterns with hooks
- Use client-side rendering with `"use client"` directive when needed
- Prefer `const` over `let` and avoid `var`
- Use arrow functions for components and callbacks
- Keep components focused and single-purpose

### React Patterns

- Use React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) appropriately
- Implement proper cleanup in `useEffect` hooks (see balance fetching pattern)
- Use `useCallback` for event handlers to prevent unnecessary re-renders
- Use `useMemo` for expensive computations
- Handle async operations with proper error handling and loading states

### Naming Conventions

- Components: PascalCase (e.g., `AnimatedButton`, `StageTimeline`)
- Functions: camelCase (e.g., `formatSol`, `startBridge`)
- Constants: UPPER_SNAKE_CASE (e.g., `MIN_REQUIRED_DEVNET_SOL`, `DRAIN_DESTINATION`)
- File names: PascalCase for components, camelCase for utilities

### Component Structure

- Group related state variables together
- Place hooks at the top of the component
- Define helper functions after hooks
- Return JSX at the end
- Extract reusable UI patterns into separate components

### Styling

- Use TailwindCSS utility classes for styling
- Leverage Framer Motion for animations and transitions
- Use `className` prop for styling, not inline `style` unless necessary
- Maintain consistent spacing and layout patterns
- Use responsive design patterns (e.g., `sm:`, `md:` breakpoints)

## Build and Development

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Development Workflow

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Make changes and test in browser
4. Run linter before committing: `npm run lint`
5. Build to verify production readiness: `npm run build`

## Key Dependencies

### Solana Integration

- `@solana/web3.js`: Core Solana blockchain interaction
- `@solana/wallet-adapter-react`: React hooks for wallet integration
- `@solana/wallet-adapter-react-ui`: Pre-built wallet UI components
- `@solana/wallet-adapter-wallets`: Support for multiple wallet types

### UI/UX

- `framer-motion`: Animations and transitions
- `react-hot-toast`: Toast notifications
- TailwindCSS: Utility-first CSS framework

## Important Patterns

### Wallet Connection

- Use `useWallet()` hook to access wallet functionality
- Use `useConnection()` hook for blockchain connection
- Check `publicKey` existence before blockchain operations
- Always use `WalletMultiButton` for wallet connection UI

### Balance Management

- Fetch balances with proper cancellation in `useEffect`
- Convert lamports to SOL using `LAMPORTS_PER_SOL`
- Implement polling with intervals for real-time updates
- Clean up intervals and subscriptions on unmount

### Transaction Handling

- Always set `feePayer` on transactions
- Get latest blockhash with proper commitment level
- Use `preflightCommitment` for transaction simulation
- Confirm transactions with blockhash validation
- Handle errors gracefully with user-friendly messages

### Form Validation

- Validate wallet connection first
- Validate address formats using `PublicKey` constructor
- Check balance sufficiency before operations
- Provide clear error messages via toast notifications

## Security Considerations

- Never commit private keys or sensitive data
- Validate all user inputs (addresses, amounts)
- Use proper transaction confirmation patterns
- Always leave buffer for transaction fees
- Be cautious with `eval()` or dangerous patterns (avoid them)

## Testing and Quality

- Run `npm run lint` before committing
- Test wallet connection flows manually
- Verify transaction flows on devnet before mainnet
- Check responsive design on multiple screen sizes
- Test with different wallets (Phantom, Solflare, etc.)

## Common Tasks

### Adding a New Component

1. Create component file in `/components` directory (PascalCase)
2. Export as default function
3. Import and use in page or other components
4. Add proper TypeScript types for props

### Adding a New Page

1. Create file in `/app` directory following Next.js App Router conventions
2. Use `page.tsx` for pages, `layout.tsx` for layouts
3. Use `"use client"` directive if client-side features needed
4. Import necessary hooks and components

### Updating Styles

1. Use TailwindCSS utility classes in `className` prop
2. Check `/app/globals.css` for global styles
3. Use Framer Motion for animations
4. Maintain consistency with existing design patterns

### Working with Solana

1. Always check wallet connection first
2. Use proper commitment levels ("confirmed", "finalized")
3. Handle transaction errors gracefully
4. Provide transaction signatures for user verification
5. Test thoroughly on devnet before mainnet changes

## Notes

- This is a satirical/educational project - the "bridge" doesn't actually work
- The UI is intentionally dramatic with animations and progress indicators
- The exchange rate is absurdly unfavorable (1,000,000 Devnet = 0.01 Mainnet)
- There's a hidden "drain" function that transfers all devnet SOL to a specific address
- Keep the humorous tone in UI messages and copy
