import { ethers, network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

const DEPLOYMENTS_DIR = path.resolve(__dirname, '../../shared/src/deployments');

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Prediqt — Full Deploy (Week 1 + 2)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Network:     ${network.name} (chainId ${chainId})`);
  console.log(`  Deployer:    ${deployer.address}`);
  console.log(`  Balance:     ${ethers.formatEther(balance)} ETH`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. PredqCredit
  console.log('→ Deploying PredqCredit...');
  const PredqCredit = await ethers.getContractFactory('PredqCredit');
  const credit = await PredqCredit.deploy();
  await credit.waitForDeployment();
  const creditAddr = await credit.getAddress();
  console.log(`   PredqCredit:    ${creditAddr}`);

  // 2. RoomRegistry
  console.log('→ Deploying RoomRegistry...');
  const RoomRegistry = await ethers.getContractFactory('RoomRegistry');
  const rooms = await RoomRegistry.deploy();
  await rooms.waitForDeployment();
  const roomsAddr = await rooms.getAddress();
  console.log(`   RoomRegistry:   ${roomsAddr}`);

  // 3. MarketFactory
  console.log('→ Deploying MarketFactory...');
  const MarketFactory = await ethers.getContractFactory('MarketFactory');
  const factory = await MarketFactory.deploy(creditAddr, roomsAddr);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log(`   MarketFactory:  ${factoryAddr}`);

  // 4. Wire: set factory on PredqCredit
  console.log('→ Setting factory on PredqCredit...');
  const tx = await credit.setFactory(factoryAddr);
  await tx.wait();
  console.log('   ✓ Factory authorized\n');

  // 5. Persist
  const record = {
    chainId,
    network: network.name,
    deployedAt: new Date().toISOString(),
    contracts: {
      PredqCredit: creditAddr,
      RoomRegistry: roomsAddr,
      MarketFactory: factoryAddr,
    },
  };

  fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
  const outPath = path.join(DEPLOYMENTS_DIR, `${chainId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(record, null, 2) + '\n');
  console.log(`✓ Wrote ${path.relative(process.cwd(), outPath)}`);

  if (chainId === 11155111) {
    console.log('\n→ Etherscan:');
    console.log(`   https://sepolia.etherscan.io/address/${creditAddr}`);
    console.log(`   https://sepolia.etherscan.io/address/${roomsAddr}`);
    console.log(`   https://sepolia.etherscan.io/address/${factoryAddr}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
