import { ethers, network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

const DEPLOYMENTS_DIR = path.resolve(__dirname, '../../shared/src/deployments');

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Prediqt — Week 2 Deployment`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Network:     ${network.name} (chainId ${chainId})`);
  console.log(`  Deployer:    ${deployer.address}`);
  console.log(`  Balance:     ${ethers.formatEther(balance)} ETH`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Load existing deployment record
  const recordPath = path.join(DEPLOYMENTS_DIR, `${chainId}.json`);
  const existing = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
  const creditAddr = existing.contracts.PredqCredit;
  const roomsAddr = existing.contracts.RoomRegistry;

  if (!creditAddr || !roomsAddr) {
    throw new Error('Week 1 contracts not deployed. Run deploy-week1 first.');
  }

  console.log(`  Using PredqCredit:   ${creditAddr}`);
  console.log(`  Using RoomRegistry:  ${roomsAddr}\n`);

  // ─── MarketFactory ───────────────────────────────────────────
  console.log('→ Deploying MarketFactory...');
  const MarketFactory = await ethers.getContractFactory('MarketFactory');
  const factory = await MarketFactory.deploy(creditAddr, roomsAddr);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log(`   MarketFactory: ${factoryAddr}`);

  // ─── Wire factory into PredqCredit ──────────────────────────
  console.log('→ Setting factory on PredqCredit...');
  const credit = await ethers.getContractAt('PredqCredit', creditAddr);
  const tx = await credit.setFactory(factoryAddr);
  await tx.wait();
  console.log('   ✓ Factory authorized to create market spenders\n');

  // ─── Update deployment record ────────────────────────────────
  existing.contracts.MarketFactory = factoryAddr;
  existing.deployedAt = new Date().toISOString();
  fs.writeFileSync(recordPath, JSON.stringify(existing, null, 2) + '\n');
  console.log(`✓ Updated ${path.relative(process.cwd(), recordPath)}`);

  if (chainId === 11155111) {
    console.log(`\n→ Etherscan:\n   https://sepolia.etherscan.io/address/${factoryAddr}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
