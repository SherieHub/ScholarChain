# ScholarChain — System Dependencies

> All system-level, network, and external service dependencies required to develop and run ScholarChain. This includes runtime environments, browser extensions, blockchain infrastructure, and third-party service accounts.

---

## 1. Development Runtime

| Dependency | Version | Purpose |
|---|---|---|
| **Node.js** | 18.x LTS or higher | JavaScript runtime for Next.js dev server and build pipeline |
| **npm** | 9.x+ (bundled with Node) | Package manager for installing project dependencies |
| **Git** | Any recent version | Version control |

> **Install Node.js:** Download from [nodejs.org](https://nodejs.org). Use `nvm` (Node Version Manager) for switching versions across projects.

---

## 2. Browser Requirements

| Dependency | Version | Purpose |
|---|---|---|
| **Google Chrome** or **Brave** | Latest stable | Host browser for Cardano wallet extensions and Next.js dev experience |
| **Firefox** | Latest stable | Alternative — Nami and Eternl support Firefox |

> Safari is **not recommended** — Cardano browser wallet extensions have limited Safari support.

---

## 3. Cardano Wallet Browser Extensions

> Both the Admin and Scholar users require a Cardano-compatible wallet extension installed in their browser. These extensions manage private keys and sign transactions.

| Extension | Chain | Network Support | Download |
|---|---|---|---|
| **Eternl** (recommended) | Cardano | Mainnet + Preprod + Preview | [eternl.io](https://eternl.io) |
| **Nami** | Cardano | Mainnet + Preprod | Chrome Web Store |

### Wallet Configuration Checklist
- [ ] Extension installed and enabled in browser
- [ ] New wallet created (or seed phrase imported)
- [ ] Network switched to **Preprod Testnet** in extension settings
- [ ] Admin wallet funded with test ADA from the Cardano Faucet (minimum ~10 tADA recommended for gas fees during development)

---

## 4. Cardano Network — Preprod Testnet

| Dependency | Details |
|---|---|
| **Network Name** | Cardano Preprod Testnet |
| **Purpose** | Development and testing environment — transactions have no real monetary value |
| **Block Time** | ~20 seconds per block |
| **Faucet URL** | [docs.cardano.org/cardano-testnets/tools/faucet](https://docs.cardano.org/cardano-testnets/tools/faucet) |
| **Explorer URL** | [preprod.cardanoscan.io](https://preprod.cardanoscan.io) |

> **Important:** All wallets (Admin and test students) must be on **Preprod**. Sending to a Mainnet address from Preprod (or vice versa) will result in an error — MeshJS enforces network matching.

---

## 5. Blockfrost API Service

> Required from **Increment 5** onward. Blockfrost acts as a hosted Cardano node API, allowing server-side blockchain queries without running a full Cardano node.

| Dependency | Details |
|---|---|
| **Service URL** | [blockfrost.io](https://blockfrost.io) |
| **Account Required** | Yes — free tier available |
| **Plan (Development)** | Free tier: 50,000 requests/day |
| **Project Type** | Create a **Preprod** project to match the development network |
| **Credential** | `PROJECT_ID` — a string like `preprod1abc...xyz` |
| **SDK Package** | `@blockfrost/blockfrost-js` (installed via npm) |

### Setup Steps
1. Register at [blockfrost.io](https://blockfrost.io)
2. Create a new project → select **Cardano Preprod**
3. Copy the generated `PROJECT_ID`
4. Store it in `.env.local` as `BLOCKFROST_PROJECT_ID=preprod_...`

---

## 6. Firebase / Firestore

> Required from **Increment 2** onward. Firebase provides a managed NoSQL database without requiring a custom backend server.

| Dependency | Details |
|---|---|
| **Service URL** | [firebase.google.com](https://firebase.google.com) |
| **Account Required** | Yes — Google Account |
| **Plan (Development)** | Spark (free) tier sufficient for development |
| **Database Type** | Cloud Firestore (NoSQL document database) |
| **SDK Package** | `firebase` (installed via npm) |

### Setup Steps
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g., `scholarchain-dev`)
3. Enable **Cloud Firestore** in Native mode
4. Go to **Project Settings → Your Apps → Web App** → Register app
5. Copy the Firebase config object into `.env.local`
6. Set Firestore security rules to allow read/write during development (tighten before production)

---

## 7. IPFS / Pinata

> Required from **Increment 3** onward, for hosting NFT badge images.

| Dependency | Details |
|---|---|
| **Service URL** | [pinata.cloud](https://pinata.cloud) |
| **Account Required** | Yes — free tier available |
| **Plan (Development)** | Free tier: 1 GB storage, sufficient for badge images |
| **Output** | An IPFS CID (Content Identifier), e.g., `ipfs://QmXyz...` |

### Setup Steps
1. Register at [pinata.cloud](https://pinata.cloud)
2. Upload the Scholar Badge PNG/SVG image
3. Copy the resulting IPFS CID link
4. Embed the link in the CIP-25 NFT metadata during minting (Increment 3)

---

## 8. Environment File Summary

| Variable | Source | Used In |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console | Client components |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Console | Client components |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Console | Client components |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Console | Client components |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console | Client components |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Console | Client components |
| `BLOCKFROST_PROJECT_ID` | Blockfrost Dashboard | API routes only (server-side) |
| `ADMIN_WALLET_ADDRESS` | Admin's Preprod wallet | API routes only (server-side) |

---

## 9. Dependency Readiness Checklist

Before beginning development, confirm all of the following:

- [ ] Node.js 18+ installed (`node -v`)
- [ ] npm 9+ installed (`npm -v`)
- [ ] Chrome/Brave installed
- [ ] Eternl or Nami extension installed and switched to **Preprod**
- [ ] Admin wallet funded with test ADA from the faucet
- [ ] Firebase project created and Firestore enabled
- [ ] Blockfrost Preprod project created and `PROJECT_ID` obtained
- [ ] Pinata account created and Scholar Badge image uploaded
- [ ] `.env.local` populated with all keys listed above
