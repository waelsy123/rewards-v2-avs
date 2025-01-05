import { ethers } from "ethers";
import * as dotenv from "dotenv";
const fs = require('fs');
const path = require('path');
dotenv.config();

// Setup env variables
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
let chainId = 31337;

const avsDeploymentData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../contracts/deployments/hello-world/${chainId}.json`), 'utf8'));
const helloWorldServiceManagerAddress = avsDeploymentData.addresses.helloWorldServiceManager;
const helloWorldServiceManagerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../abis/HelloWorldServiceManager.json'), 'utf8'));
// Initialize contract objects from ABIs
const helloWorldServiceManager = new ethers.Contract(helloWorldServiceManagerAddress, helloWorldServiceManagerABI, wallet);

// Define the OperatorDirectedRewardsSubmission structure
interface OperatorDirectedRewardsSubmission {
    strategiesAndMultipliers: { strategy: string; multiplier: number }[];
    token: string;
    operatorRewards: { operator: string; amount: string }[];
    startTimestamp: number;
    duration: number;
    description: string;
}

// Function to submit operator-directed rewards
async function submitOperatorDirectedRewards(submissions: OperatorDirectedRewardsSubmission[]) {
    try {
        // Send a transaction to the submitOperatorDirectedRewards function
        const tx = await helloWorldServiceManager.submitOperatorDirectedRewards(submissions);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        console.log(`Transaction successful with hash: ${receipt.hash}`);
    } catch (error) {
        console.error('Error sending transaction:', error);
    }
}

// Example data for operator-directed rewards submission
const exampleSubmissions: OperatorDirectedRewardsSubmission[] = [
    {
        strategiesAndMultipliers: [
            { strategy: avsDeploymentData.addresses.strategy, multiplier: 1000 },
        ],
        token: avsDeploymentData.addresses.token,
        operatorRewards: [
            { operator: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", amount: "99" },
        ],
        startTimestamp: Math.floor(Date.now() / 1000),
        duration: 60, // 1 minute
        description: "Operator-directed rewards for performance"
    }
];

// Start the process
submitOperatorDirectedRewards(exampleSubmissions);