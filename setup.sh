#!/usr/bin/env bash
# =============================================================================
# ReliefChain — Automated Project Setup Script (Enhanced Version)
# Author: Sandipan Mondal (Enhanced by AI)
# Description: Creates a production-ready Web3 Monorepo scaffold
# Usage: chmod +x setup.sh && ./setup.sh
# =============================================================================

set -e

# ─── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─── Banner ───────────────────────────────────────────────────────────────────
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║      ReliefChain Project Setup (Enhanced Edition)    ║"
echo "║        Production-ready Web3 & MERN Stack            ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

ROOT="reliefchain"

mkfile() {
  local path="$1"
  local content="$2"
  mkdir -p "$(dirname "$path")"
  echo -e "$content" > "$path"
}

mkdir_only() {
  mkdir -p "$1"
  echo -e "${BLUE}  📁 $1${NC}"
}

log_file() {
  echo -e "${GREEN}  ✅ $1${NC}"
}

log_section() {
  echo ""
  echo -e "${YELLOW}▶ $1${NC}"
}

# =============================================================================
# ROOT (Monorepo Setup)
# =============================================================================
log_section "Creating root Monorepo directory"
mkdir -p "$ROOT"

mkfile "$ROOT/.gitignore" "node_modules/
.env
*.local
artifacts/
cache/
typechain-types/
coverage/
dist/
build/
.DS_Store
.husky/_/"
log_file ".gitignore"

mkfile "$ROOT/README.md" "# ReliefChain :earth_africa:
> Decentralized Disaster Relief Governance System

Production-ready monorepo combining Solidity Smart Contracts, Express/Node.js Backend, and React/Tailwind/Wagmi Frontend.

## Architecture
- **Contracts**: Hardhat, OpenZeppelin, Solhint, Gas Reporter.
- **Backend**: Express, MongoDB, Redis, Swagger API Docs, Zod Validation.
- **Frontend**: React, TailwindCSS, Wagmi, Viem, Recharts.
- **Infrastructure**: Docker, GitHub Actions CI.

## Quick Start
\`\`\`bash
# 1. Install dependencies for all workspaces
npm install

# 2. Start Local Environment (Redis/MongoDB)
docker-compose up -d

# 3. Setup Environment Variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp contracts/.env.example contracts/.env

# 4. Start Development
# Terminal 1: Local Blockchain node
npm run chain
# Terminal 2: Deploy contracts locally
npm run deploy:local
# Terminal 3: Start backend & frontend concurrently
npm run dev
\`\`\`"
log_file "README.md"

mkfile "$ROOT/package.json" "{
  \"name\": \"reliefchain-monorepo\",
  \"version\": \"1.0.0\",
  \"private\": true,
  \"workspaces\": [
    \"contracts\",
    \"backend\",
    \"frontend\"
  ],
  \"scripts\": {
    \"dev\": \"npm run dev:backend & npm run dev:frontend\",
    \"dev:backend\": \"npm run dev --workspace=backend\",
    \"dev:frontend\": \"npm start --workspace=frontend\",
    \"chain\": \"npm run node --workspace=contracts\",
    \"deploy:local\": \"npm run deploy:local --workspace=contracts\",
    \"test\": \"npm test --workspace=contracts && npm test --workspace=backend\",
    \"lint\": \"npm run lint --workspaces\",
    \"format\": \"prettier --write \\\"**/*.{js,jsx,ts,tsx,json,sol,md}\\\"\",
    \"prepare\": \"husky install\"
  },
  \"devDependencies\": {
    \"concurrently\": \"^8.2.2\",
    \"husky\": \"^8.0.3\",
    \"lint-staged\": \"^15.2.0\",
    \"prettier\": \"^3.2.5\",
    \"prettier-plugin-solidity\": \"^1.3.1\"
  },
  \"lint-staged\": {
    \"*.{js,jsx,ts,tsx}\": [\"prettier --write\", \"eslint --fix\"],
    \"*.sol\": [\"prettier --write\", \"solhint\"]
  }
}"
log_file "package.json (Root)"

mkfile "$ROOT/.prettierrc" "{
  \"semi\": true,
  \"trailingComma\": \"all\",
  \"singleQuote\": true,
  \"printWidth\": 100,
  \"tabWidth\": 2,
  \"plugins\": [\"prettier-plugin-solidity\"],
  \"overrides\": [
    {
      \"files\": \"*.sol\",
      \"options\": {
        \"printWidth\": 120,
        \"tabWidth\": 4,
        \"singleQuote\": false,
        \"explicitTypes\": \"always\"
      }
    }
  ]
}"
log_file ".prettierrc"

# Docker & CI
mkfile "$ROOT/docker-compose.yml" "version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports:
      - \"27017:27017\"
    volumes:
      - mongodb_data:/data/db
  redis:
    image: redis:7-alpine
    ports:
      - \"6379:6379\"
volumes:
  mongodb_data:"
log_file "docker-compose.yml"

mkdir_only "$ROOT/.github/workflows"
mkfile "$ROOT/.github/workflows/ci.yml" "name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run lint
      - run: npm test"
log_file "CI Workflow"

# =============================================================================
# CONTRACTS
# =============================================================================
log_section "Setting up Smart Contracts workspace"

mkdir_only "$ROOT/contracts/core"
mkdir_only "$ROOT/contracts/governance"
mkdir_only "$ROOT/contracts/interfaces"
mkdir_only "$ROOT/contracts/libraries"
mkdir_only "$ROOT/contracts/mocks"
mkdir_only "$ROOT/scripts/deploy"
mkdir_only "$ROOT/scripts/utils"
mkdir_only "$ROOT/test"

# Core Contracts
mkfile "$ROOT/contracts/core/DonationVault.sol" "// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import \"@openzeppelin/contracts/access/Ownable.sol\";
import \"@openzeppelin/contracts/utils/ReentrancyGuard.sol\";

/// @title DonationVault
/// @notice Escrows funds, protected against reentrancy.
contract DonationVault is Ownable, ReentrancyGuard {
    mapping(uint256 => uint256) public projectBalances;

    event DonationReceived(address indexed donor, uint256 indexed projectId, uint256 amount);
    event FundsReleased(uint256 indexed projectId, address indexed ngo, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function donate(uint256 projectId) external payable nonReentrant {
        require(msg.value > 0, \"Zero donation\");
        projectBalances[projectId] += msg.value;
        emit DonationReceived(msg.sender, projectId, msg.value);
    }

    function releaseFunds(uint256 projectId, address payable ngo, uint256 amount) external onlyOwner nonReentrant {
        require(projectBalances[projectId] >= amount, \"Insufficient balance\");
        projectBalances[projectId] -= amount;
        (bool sent, ) = ngo.call{value: amount}(\"\");
        require(sent, \"Transfer failed\");
        emit FundsReleased(projectId, ngo, amount);
    }
}"
log_file "DonationVault.sol"

# Hardhat Config with Gas Reporter & Solhint
mkfile "$ROOT/contracts/hardhat.config.js" "require(\"@nomicfoundation/hardhat-toolbox\");
require(\"hardhat-gas-reporter\");
require(\"solidity-coverage\");
require(\"dotenv\").config();

module.exports = {
  solidity: {
    version: \"0.8.20\",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    hardhat: { chainId: 1337 },
    mumbai: {
      url: process.env.POLYGON_RPC_URL || \"\",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: \"USD\",
  },
  etherscan: { apiKey: process.env.POLYGONSCAN_API_KEY },
};"
log_file "hardhat.config.js"

mkfile "$ROOT/contracts/.solhint.json" "{
  \"extends\": \"solhint:recommended\",
  \"rules\": {
    \"compiler-version\": [\"error\", \"^0.8.20\"],
    \"func-visibility\": [\"warn\", {\"ignoreConstructors\": true}]
  }
}"
log_file ".solhint.json"

mkfile "$ROOT/contracts/package.json" "{
  \"name\": \"reliefchain-contracts\",
  \"version\": \"1.0.0\",
  \"scripts\": {
    \"compile\": \"hardhat compile\",
    \"node\": \"hardhat node\",
    \"test\": \"hardhat test\",
    \"coverage\": \"hardhat coverage\",
    \"deploy:local\": \"hardhat run scripts/deploy/01_deploy_token.js --network localhost\",
    \"lint\": \"solhint 'contracts/**/*.sol'\"
  },
  \"devDependencies\": {
    \"@nomicfoundation/hardhat-toolbox\": \"^4.0.0\",
    \"hardhat\": \"^2.22.0\",
    \"hardhat-gas-reporter\": \"^1.0.9\",
    \"solidity-coverage\": \"^0.8.5\",
    \"solhint\": \"^4.1.1\",
    \"dotenv\": \"^16.0.0\"
  },
  \"dependencies\": {
    \"@openzeppelin/contracts\": \"^5.0.0\"
  }
}"
log_file "package.json (contracts)"
mkfile "$ROOT/contracts/.env.example" "POLYGON_RPC_URL=
PRIVATE_KEY=
POLYGONSCAN_API_KEY=
REPORT_GAS=true"

# =============================================================================
# BACKEND
# =============================================================================
log_section "Setting up Backend (Node.js/Express + Security/Docs)"

mkdir_only "$ROOT/backend/src/config"
mkdir_only "$ROOT/backend/src/controllers"
mkdir_only "$ROOT/backend/src/routes"
mkdir_only "$ROOT/backend/src/middleware"
mkdir_only "$ROOT/backend/src/services"
mkdir_only "$ROOT/backend/src/models"
mkdir_only "$ROOT/backend/src/utils"
mkdir_only "$ROOT/backend/src/validations"

mkfile "$ROOT/backend/src/server.js" "const app = require('./app');
const connectDB = require('./config/db');
const redisClient = require('./config/redis');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await redisClient.connect().catch(console.error);
  app.listen(PORT, () => console.log(\`ReliefChain API running on port \${PORT}\`));
}
start();"
log_file "backend/src/server.js"

mkfile "$ROOT/backend/src/app.js" "const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => res.send('OK'));

app.use(errorHandler);
module.exports = app;"
log_file "backend/src/app.js"

mkfile "$ROOT/backend/src/config/swagger.js" "const swaggerJSDoc = require('swagger-jsdoc');
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'ReliefChain API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.js'],
};
module.exports = swaggerJSDoc(options);"
log_file "swagger.js"

mkfile "$ROOT/backend/src/config/redis.js" "const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis connected'));
module.exports = client;"
log_file "redis.js"

mkfile "$ROOT/backend/src/config/db.js" "const mongoose = require('mongoose');
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reliefchain');
  console.log('MongoDB connected');
};
module.exports = connectDB;"

mkfile "$ROOT/backend/src/middleware/validateRequest.js" "const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    res.status(400).json({ error: err.errors });
  }
};
module.exports = validate;"
log_file "validateRequest.js"

mkfile "$ROOT/backend/src/validations/projectSchema.js" "const { z } = require('zod');
exports.createProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  targetAmount: z.number().positive(),
});"

mkfile "$ROOT/backend/Dockerfile" "FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD [\"npm\", \"start\"]"
log_file "Backend Dockerfile"

mkfile "$ROOT/backend/package.json" "{
  \"name\": \"reliefchain-backend\",
  \"version\": \"1.0.0\",
  \"main\": \"src/server.js\",
  \"scripts\": {
    \"start\": \"node src/server.js\",
    \"dev\": \"nodemon src/server.js\",
    \"lint\": \"eslint src/**/*.js\"
  },
  \"dependencies\": {
    \"express\": \"^4.19.0\",
    \"cors\": \"^2.8.5\",
    \"helmet\": \"^7.1.0\",
    \"express-rate-limit\": \"^7.2.0\",
    \"swagger-ui-express\": \"^5.0.0\",
    \"swagger-jsdoc\": \"^6.2.8\",
    \"mongoose\": \"^8.0.0\",
    \"redis\": \"^4.6.13\",
    \"zod\": \"^3.22.4\",
    \"ethers\": \"^6.11.0\",
    \"dotenv\": \"^16.0.0\"
  },
  \"devDependencies\": {
    \"nodemon\": \"^3.0.0\",
    \"eslint\": \"^8.57.0\"
  }
}"
log_file "package.json (backend)"
mkfile "$ROOT/backend/.env.example" "PORT=5000\nMONGODB_URI=mongodb://localhost:27017/reliefchain\nREDIS_URL=redis://localhost:6379"

# =============================================================================
# FRONTEND
# =============================================================================
log_section "Setting up Frontend (React + Tailwind + Wagmi)"

mkdir_only "$ROOT/frontend/public"
mkdir_only "$ROOT/frontend/src/assets"
mkdir_only "$ROOT/frontend/src/components/ui"
mkdir_only "$ROOT/frontend/src/components/common"
mkdir_only "$ROOT/frontend/src/pages"
mkdir_only "$ROOT/frontend/src/hooks"
mkdir_only "$ROOT/frontend/src/services"

mkfile "$ROOT/frontend/public/index.html" "<!DOCTYPE html>
<html lang=\"en\">
  <head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>ReliefChain Web3 Portal</title>
  </head>
  <body class=\"bg-slate-900 text-slate-100\">
    <div id=\"root\"></div>
  </body>
</html>"

mkfile "$ROOT/frontend/src/index.jsx" "import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygonMumbai, localhost } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  chains: [localhost, polygonMumbai],
  transports: { [localhost.id]: http(), [polygonMumbai.id]: http() },
});
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);"
log_file "frontend/src/index.jsx (Wagmi Setup)"

mkfile "$ROOT/frontend/src/App.jsx" "import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';

export default function App() {
  return (
    <Router>
      <div className=\"min-h-screen bg-slate-900\">
        <Navbar />
        <main className=\"container mx-auto px-4 py-8\">
          <Routes>
            <Route path=\"/\" element={<h1 className=\"text-4xl font-bold font-sans text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400\">ReliefChain Home</h1>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}"

mkfile "$ROOT/frontend/src/components/common/Navbar.jsx" "import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <nav className=\"flex justify-between items-center p-4 bg-slate-800/50 backdrop-blur-md border-b border-slate-700 shadow-xl sticky top-0 z-50\">
      <div className=\"text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent\">
        ReliefChain
      </div>
      <div>
        {isConnected ? (
          <button onClick={() => disconnect()} className=\"px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600\">
            {address?.slice(0,6)}...{address?.slice(-4)}
          </button>
        ) : (
          <button onClick={() => connect({ connector: injected() })} className=\"px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/20 ring-1 ring-blue-500\">
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}"
log_file "Navbar.jsx (Wagmi Connect)"

mkfile "$ROOT/frontend/src/index.css" "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody { font-family: 'Inter', sans-serif; }"
mkfile "$ROOT/frontend/tailwind.config.js" "/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [\"./src/**/*.{js,jsx,ts,tsx}\"],
  theme: { extend: {} },
  plugins: [],
};"
log_file "Tailwind Setup"

mkfile "$ROOT/frontend/Dockerfile" "FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD [\"npm\", \"start\"]"
log_file "Frontend Dockerfile"

mkfile "$ROOT/frontend/package.json" "{
  \"name\": \"reliefchain-frontend\",
  \"version\": \"1.0.0\",
  \"scripts\": {
    \"start\": \"react-scripts start\",
    \"build\": \"react-scripts build\",
    \"lint\": \"eslint src/**/*.{js,jsx}\"
  },
  \"dependencies\": {
    \"react\": \"^18.2.0\",
    \"react-dom\": \"^18.2.0\",
    \"react-router-dom\": \"^6.22.0\",
    \"react-scripts\": \"5.0.1\",
    \"wagmi\": \"^2.5.7\",
    \"viem\": \"^2.7.12\",
    \"@tanstack/react-query\": \"^5.24.1\",
    \"lucide-react\": \"^0.344.0\",
    \"clsx\": \"^2.1.0\",
    \"tailwind-merge\": \"^2.2.1\"
  },
  \"devDependencies\": {
    \"tailwindcss\": \"^3.4.1\",
    \"postcss\": \"^8.4.35\",
    \"autoprefixer\": \"^10.4.17\"
  }
}"
log_file "package.json (frontend)"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════╗"
echo -e "║            ✅ Enhanced Setup Complete!               ║"
echo -e "╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📁 Project created at: ./$ROOT/${NC}"
echo ""
echo -e "${GREEN}Next Steps inside reliefchain/:${NC}"
echo "  1. npm install               (installs everything in all workspaces)"
echo "  2. docker-compose up -d      (starts MongoDB and Redis locally)"
echo "  3. npm run chain             (Term 1: runs local hardhat node)"
echo "  4. npm run deploy:local      (Term 2: deploys contracts)"
echo "  5. npm run dev               (Term 3: concurrently starts backend + frontend)"
echo ""
echo -e "${CYAN}Happy building! 🚀${NC}"
