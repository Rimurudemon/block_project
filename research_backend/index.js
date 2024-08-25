const express = require("express");
const { ethers } = require("ethers");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(express.json());
const cors = require("cors");

// In-memory store for users
const users = {};

// Set up CORS
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: "*", // Allow all methods (GET, POST, PUT, DELETE, etc.)
    allowedHeaders: "*", // Allow all headers
    credentials: true, // Allow credentials (cookies, etc.)
  })
);

// Initialize Ethereum provider and wallet
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.open-campus-codex.gelato.digital/"
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "mentee",
        type: "address",
      },
    ],
    name: "MenteeAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "mentor",
        type: "address",
      },
    ],
    name: "MentorAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "mentor",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ProjectFunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "mentee",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ProjectRequested",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_mentee",
        type: "address",
      },
    ],
    name: "addMentee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_mentor",
        type: "address",
      },
    ],
    name: "addMentor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_projectId",
        type: "uint256",
      },
    ],
    name: "fundProject",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_projectId",
        type: "uint256",
      },
    ],
    name: "getProject",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "mentees",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "mentors",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "projectCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "projects",
    outputs: [
      {
        internalType: "address",
        name: "mentee",
        type: "address",
      },
      {
        internalType: "string",
        name: "projectDetails",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "requestedAmount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "funded",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_projectDetails",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_requestedAmount",
        type: "uint256",
      },
    ],
    name: "requestFunding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// User registration
app.post("/register", async (req, res) => {
  const { role, address, password } = req.body;

  if (users[address]) {
    return res.status(400).send("User already exists");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users[address] = { role, password: hashedPassword };
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// User login
app.post("/login", async (req, res) => {
  const { address, password } = req.body;

  const user = users[address];
  if (!user) {
    return res.status(400).send("User not found");
  }

  try {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).send("Invalid credentials");
    }
    res.status(200).send(`Login successful as ${user.role}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Request funding by mentees
app.post("/requestFunding", async (req, res) => {
  const { address, projectDetails, requestedAmount } = req.body;

  if (!users[address] || users[address].role !== "mentee") {
    return res.status(403).send("Unauthorized");
  }

  try {
    const tx = await contract.requestFunding(
      projectDetails,
      ethers.utils.parseEther(requestedAmount)
    );
    await tx.wait();
    res.status(200).send("Funding requested successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Fund a project by mentors
app.post("/fundProject", async (req, res) => {
  const { address, projectId, amount } = req.body;

  if (!users[address] || users[address].role !== "mentor") {
    return res.status(403).send("Unauthorized");
  }

  try {
    const tx = await contract.fundProject(projectId, {
      value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    res.status(200).send(`Project ${projectId} funded successfully`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add new project by mentees
app.post("/addProject", async (req, res) => {
  const { address, projectDetails, requestedAmount } = req.body;

  if (!users[address] || users[address].role !== "mentee") {
    return res.status(403).send("Unauthorized");
  }

  try {
    const tx = await contract.requestFunding(
      projectDetails,
      ethers.utils.parseEther(requestedAmount)
    );
    await tx.wait();
    res.status(200).send("Project added successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get project details
app.get("/getProject/:id", async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await contract.getProject(projectId);

    res.status(200).json(project);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Server listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
