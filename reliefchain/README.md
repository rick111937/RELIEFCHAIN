# ReliefChain 🌍
> **Decentralized Disaster Relief Governance System**

A production-ready monorepo combining **Solidity Smart Contracts**, an **Express/Node.js Backend**, and a **React/Tailwind CSS Frontend** designed for transparent fund allocation and disaster relief coordination.

---

## 🏗 Architecture
The workspace is managed as an **NPM Monorepo** containing three core layers:

| Component | Technology Stack | Description |
| :--- | :--- | :--- |
| **`contracts/`** | Solidity, Hardhat, OpenZeppelin | On-chain governance, fund management, and safety protocols. |
| **`backend/`** | Node.js, Express, MongoDB, Redis | API services, caching layer, rate-limiting, and validation. |
| **`frontend/`** | React, TailwindCSS, Wagmi, RainbowKit | Client portal integrating Web3 connection and intuitive analytics. |

---

## ⚙ Prerequisites
Ensure you have the following tools installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [Docker & Docker Compose](https://www.docker.com/) (For database setup)
- [MetaMask](https://metamask.io/) or another supported Web3 Wallet extension

---

## 🚀 Quick Start Guide

Follow these steps to spin up the local development environment.

### 1. Install Dependencies
Install packages for the full monorepo:
```bash
npm install
```

### 2. Spin up Services
Start background services like **MongoDB** and **Redis** via Docker:
```bash e
docker-compose up -d
```

### 3. Setup Environment Variables
Clone template environment variables in both backend and frontend workspaces:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp contracts/.env.example contracts/.env
```
> [!NOTE]
> Update `.env` variables with your local configuration (Ports, DB URIs, RPC keys).

### 4. Deploy Smart Contracts
Start a local hardhat node and deploy contracts on localhost chain:
```bash
# Terminal 1: Start local node
npm run chain

# Terminal 2: Deploy contracts
npm run deploy:local
```

### 5. Start App Concurrently
Run both Backend services and Frontend client development servers with a single command:
```bash
npm run dev
```

---

## 🛠 Tech Stack Details

### **Smart Contracts**
- **Framework**: Hardhat
- **Libraries**: `@openzeppelin/contracts`
- **Validators**: `solhint`, `hardhat-gas-reporter`

### **Backend**
- **Web Framework**: Express.js
- **Database**: MongoDB (Mongoose) + Redis (Cache)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

### **Frontend**
- **Base**: React (Client)
- **Styling**: TailwindCSS
- **Web3 Integrations**: `@rainbow-me/rainbowkit`, `wagmi`, `viem`
- **State Management**: `@tanstack/react-query`

---

## 🧪 Testing Suites
To run testing scripts inside respective spaces, you can use Root Workspace scripts:
```bash
# Test contracts & backend in parallel
npm run test
```
To run individually:
- Contracts: `cd contracts && npm test`
- Backend: `cd backend && npm test`

---

## 📄 License
MIT License.
