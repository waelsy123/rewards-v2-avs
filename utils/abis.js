const fs = require('fs');
const path = require('path');

const configFile = 'contractsToExtract.json';
const defaultContracts = [
  'IAVSDirectory',
  'IDelegationManager',
  'ECDSAStakeRegistry',
  'HelloWorldServiceManager'
];
const abiDir = 'abis';
const contractsDir = 'contracts';
const artifactsDir = path.join(contractsDir, 'out');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
}

function readConfig() {
  try {
    const data = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    return Array.isArray(data) && data.length ? data : defaultContracts;
  } catch {
    return defaultContracts;
  }
}

function validateArtifacts(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.error(`Missing: ${dirPath}`);
    console.log('Run "forge build" first');
    process.exit(1);
  }
  const content = fs.readdirSync(dirPath);
  if (!content.length) {
    console.error(`Empty: ${dirPath}`);
    console.log('Run "forge build" or verify the path');
    process.exit(1);
  }
}

function readContractData(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(fileContent);
  if (!parsed.abi) throw new Error('ABI not found in contract JSON');
  return parsed.abi;
}

function extractAbi(contractName) {
  const jsonPath = path.join(artifactsDir, `${contractName}.sol`, `${contractName}.json`);
  const abiPath = path.join(abiDir, `${contractName}.json`);
  const abi = readContractData(jsonPath);
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  console.log(`Extracted ABI for ${contractName}`);
}

function extractAllAbis() {
  const contracts = readConfig();
  contracts.forEach(contract => {
    try {
      extractAbi(contract);
    } catch (e) {
      console.error(`Failed to extract ABI for ${contract}: ${e.message}`);
    }
  });
}

function logSummary() {
  const files = fs.readdirSync(abiDir);
  console.log(`ABI extraction complete. ${files.length} files in '${abiDir}'.`);
}

ensureDir(abiDir);
validateArtifacts(artifactsDir);
extractAllAbis();
logSummary();
