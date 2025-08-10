# X-Change: Revolutionizing Charitable Giving with DeFi

![X-Change Banner](frontend/public/logos/x-change-logo.png)

> **🏆 Built for OKX ETHCC 2025 Hackathon**
> **🌐 Live Demo:** [https://x-change-ezlcwcocv-alvinyap510s-projects.vercel.app/](https://x-change-ezlcwcocv-alvinyap510s-projects.vercel.app/)

---

## 🚀 Vision

**What if you could fund NGOs without losing your capital?**

- Traditional donations mean your money is gone forever.
- **X-Change** flips the model — you stake your crypto (ETH/USDC) on behalf of NGOs. The yield funds their work, while you reclaim your full principal after 6–24 months.

---

## 📖 Background

I’m a **DeFi builder**, **fintech founder**, and **social activist**.
While exploring DeFi innovations like **self-repaying loans** (e.g., Alchemix), I began to wonder:
**What if the same concept could fund NGOs sustainably — without donors losing their capital?**

That question sparked the creation of **X-Change**.

---

## ❗ Problems We’re Solving

- **High Fundraising Commissions** — In developing countries like Malaysia, NGOs often rely on fundraising agents who take **20%–70%** of the total raised.
- **Unsustainable Funding Model** — NGOs typically receive funds as a one-time lump sum, which is difficult for long-term planning and sustainability.
- **Permanent Capital Loss** — Traditional donations mean the donor’s money is gone forever, creating a psychological barrier to giving.

---

## 💡 How It Works

1. **Choose an NGO** from our verified on-chain registry.
2. **Stake your tokens** (USDC or WETH) for a fixed term (6, 12, or 24 months).
3. **Set your yield allocation** — 50%, 75%, or 100% to the NGO. The funds will be used to generate yield on platform like Aave or Pendle.
4. **Retrieve your full principal** at the end of the term (plus extra yield if partial allocation).

**Example:** Stake $1,000 USDC at 10% APY for 12 months, allocating 75% yield to the NGO.
- NGO receives $75
- You get back $1,000 principal + $25 yield

## 🏗 Architecture

### 🔗 On-Chain
- **Network:** X Layer Mainnet (Chain ID: 196) - because we can't get OKB tokens on Testnet 🙈
- All contracts deployed & verified on OKLink
- **3 verified NGOs** ready for staking
- Mock tokens with simulated APY (USDC 10%, WETH 8%)

### 🎨 Frontend
- **Next.js 15** + TypeScript + Tailwind CSS
- **RainbowKit** wallet integration
- Real-time price feeds from **OKX DEX API**
- Fully responsive & mobile-friendly UI

### 🔧 Smart Contracts
| Contract | Address | Explorer |
|----------|---------|----------|
| NGORegistry | `0x771a3e012eD22FEc509668593Cb12AA677C41Dbd` | [View](https://www.oklink.com/xlayer/address/0x771a3e012eD22FEc509668593Cb12AA677C41Dbd) |
| MorphImpactStaking | `0x1340faD914A325AE274a4FDF168a528429907e35` | [View](https://www.oklink.com/xlayer/address/0x1340faD914A325AE274a4FDF168a528429907e35) |
| MockYieldVault | `0x9123F2c69f1990DdA4a1588c89e49E1B39eE25b1` | [View](https://www.oklink.com/xlayer/address/0x9123F2c69f1990DdA4a1588c89e49E1B39eE25b1) |
| YieldDistributor | `0xC1c3837ca85886AC13672b48E54aa827e643926e` | [View](https://www.oklink.com/xlayer/address/0xC1c3837ca85886AC13672b48E54aa827e643926e) |
| MockUSDC | `0xa2dCeE55cD951D809C0762574ed4016E31E18419` | [View](https://www.oklink.com/xlayer/address/0xa2dCeE55cD951D809C0762574ed4016E31E18419) |
| MockWETH | `0x94117FD7961b2DDd56725DfD5Ba2FcCFc56F3282` | [View](https://www.oklink.com/xlayer/address/0x94117FD7961b2DDd56725DfD5Ba2FcCFc56F3282) |

---

## 🛠 Technical Overview

### Smart Contract Features
- Role-based NGO registry with admin verification
- Flexible staking terms (6, 12, 24 months)
- Yield allocation options (50%, 75%, 100%)
- NFT position tokens
- Emergency pause/withdraw functions
- Full event logging

### Frontend Features
- Multi-wallet connection via RainbowKit
- NGO discovery with filtering
- Intuitive staking flow with live yield calculation
- Portfolio dashboard for active positions
- NGO self-registration flow
- Live OKX price integration

### Security & Quality
- Foundry-based unit tests
- Gas-optimized functions
- Robust error handling
- Strict TypeScript typing

---

## 📦 Quick Start

### Requirements
- Node.js 18+
- pnpm
- Foundry
- X Layer RPC access

```bash
# Clone repo
git clone <repo-url>
cd hackathon-2025-ethcc-okx-xchange

# Backend
cd backend
forge install
forge test

# Frontend
cd ../frontend
pnpm install
cp .env.example .env.local
# Add OKX API credentials
pnpm dev

# Frontend .env.local:
NEXT_PUBLIC_OKX_API_KEY=your_api_key
NEXT_PUBLIC_OKX_SECRET_KEY=your_secret_key
NEXT_PUBLIC_OKX_API_PASSPHRASE=your_passphrase
```

## 📱 User Flow
- **Discover NGOs** — Browse & filter verified NGO profiles.
- **Stake for Impact** — Select amount, term, and yield allocation.
- **Track Portfolio** — Monitor positions & yield generation.