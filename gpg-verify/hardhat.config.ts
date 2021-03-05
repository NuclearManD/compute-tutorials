import { HardhatUserConfig, task, types } from "hardhat/config";

import "hardhat-deploy";
import "hardhat-deploy-ethers";

const config: HardhatUserConfig = {
  networks: {
    localhost: {
      url: "http://localhost:8545",
    },
  },
  solidity: {
    version: "0.7.4",
  },
  external: {
    contracts: [
      {
        artifacts: "node_modules/@cartesi/descartes-sdk/export/artifacts",
        deploy: "node_modules/@cartesi/descartes-sdk/dist/deploy",
      },
    ],
    deployments: {
      localhost: ["../descartes-env/deployments/localhost"],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    alice: {
      default: 0,
    },
    bob: {
      default: 1,
    },
  },
};

// TASKS

// instantiate task
task("instantiate", "Instantiate a GpgVerify computation").setAction(
  async ({}, hre) => {
    const { ethers } = hre;
    const descartes = await ethers.getContract("Descartes");
    const contract = await ethers.getContract("GpgVerify");

    const { alice, bob } = await hre.getNamedAccounts();

    const tx = await contract.instantiate([alice, bob]);

    // retrieves created computation's index
    const index = await new Promise((resolve) => {
      descartes.on("DescartesCreated", (index) => resolve(index));
    });

    console.log(
      `Instantiation successful with index '${index}' (tx: ${tx.hash} ; blocknumber: ${tx.blockNumber})\n`
    );
  }
);

// instantiate task using logger drives
task(
  "instantiate-logger",
  "Instantiate a GpgVerify computation using logger drives"
)
  .addOptionalParam(
    "docroothash",
    "The Logger root hash for the document",
    "0x1b0fba479b956097d0ec40f1f7701fe2d87db95533a169e5c9ef0f0f4bcfbfc3",
    types.string
  )
  .addOptionalParam(
    "doclog2size",
    "Log2 size of the document data stored in the Logger",
    10,
    types.int
  )
  .addOptionalParam(
    "sigroothash",
    "The Logger root hash for the signature",
    "0xde4bf0395d168034e505163232c458e043ce9aaca9e84b1f59c351b2a05a9192",
    types.string
  )
  .addOptionalParam(
    "siglog2size",
    "Log2 size of the signature data stored in the Logger",
    10,
    types.int
  )
  .setAction(
    async ({ docroothash, doclog2size, sigroothash, siglog2size }, hre) => {
      const { ethers } = hre;
      const descartes = await ethers.getContract("Descartes");
      const contract = await ethers.getContract("GpgVerify");
      const logger = await ethers.getContract("Logger");

      const isDocAvail = await logger.isLogAvailable(docroothash, doclog2size);
      const isSigAvail = await logger.isLogAvailable(sigroothash, siglog2size);
      if (!isDocAvail) {
        console.error(
          `Document is not available in the logger with root hash '${docroothash}' and log2size ${doclog2size} `
        );
      }
      if (!isSigAvail) {
        console.error(
          `Signature is not available in the logger with root hash '${sigroothash}' and log2size ${siglog2size} `
        );
      }
      if (!isDocAvail || !isSigAvail) {
        console.error("Aborting.");
        return;
      }

      const { alice, bob } = await hre.getNamedAccounts();

      const tx = await contract.instantiateWithLoggerIpfs(
        [alice, bob],
        "0x00",
        docroothash,
        doclog2size,
        "0x00",
        sigroothash,
        siglog2size
      );

      // retrieves created computation's index
      const index = await new Promise((resolve) => {
        descartes.on("DescartesCreated", (index) => resolve(index));
      });

      console.log(
        `Instantiation successful with index '${index}' (tx: ${tx.hash} ; blocknumber: ${tx.blockNumber})\n`
      );
    }
  );

// instantiate task using ipfs drives
task(
  "instantiate-ipfs",
  "Instantiate a GpgVerify computation using ipfs drives"
)
  .addOptionalParam(
    "docipfspath",
    "The IPFS path for the document",
    "QmZM34TdjqE7hWqURJLWhZuKxB38fqBNZnk9JuF9CmwHGA",
    types.string
  )
  .addOptionalParam(
    "docroothash",
    "The Logger root hash for the document",
    "0x1b0fba479b956097d0ec40f1f7701fe2d87db95533a169e5c9ef0f0f4bcfbfc3",
    types.string
  )
  .addOptionalParam(
    "doclog2size",
    "Log2 size of the document data stored in the Logger",
    10,
    types.int
  )
  .addOptionalParam(
    "sigipfspath",
    "The IPFS path for the document",
    "QmdJoRUwomKnYX1zqfGxRTgPBBkZwTPvCU7F1QEv3Qt972",
    types.string
  )
  .addOptionalParam(
    "sigroothash",
    "The Logger root hash for the signature",
    "0xde4bf0395d168034e505163232c458e043ce9aaca9e84b1f59c351b2a05a9192",
    types.string
  )
  .addOptionalParam(
    "siglog2size",
    "Log2 size of the signature data stored in the Logger",
    10,
    types.int
  )
  .setAction(
    async (
      {
        docipfspath,
        docroothash,
        doclog2size,
        sigipfspath,
        sigroothash,
        siglog2size,
      },
      hre
    ) => {
      const { ethers } = hre;
      const descartes = await ethers.getContract("Descartes");
      const contract = await ethers.getContract("GpgVerify");

      const { alice, bob } = await hre.getNamedAccounts();

      const tx = await contract.instantiateWithLoggerIpfs(
        [alice, bob],
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(`/ipfs/${docipfspath}`)),
        docroothash,
        doclog2size,
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(`/ipfs/${sigipfspath}`)),
        sigroothash,
        siglog2size
      );

      // retrieves created computation's index
      const index = await new Promise((resolve) => {
        descartes.on("DescartesCreated", (index) => resolve(index));
      });

      console.log(
        `Instantiation successful with index '${index}' (tx: ${tx.hash} ; blocknumber: ${tx.blockNumber})\n`
      );
    }
  );

// get-result task
task("get-result", "Retrieves a GpgVerify computation result given its index")
  .addOptionalParam("index", "The GpgVerify computation index", 0, types.int)
  .setAction(async ({ index }, hre) => {
    const { ethers } = hre;
    const contract = await ethers.getContract("GpgVerify");

    console.log("");
    console.log("Getting result using index '" + index + "'\n");

    const ret = await contract.getResult(index);
    console.log("Full result: " + JSON.stringify(ret));
    if (ret["3"]) {
      console.log(
        `Result value as string: ${ethers.utils.toUtf8String(ret["3"])}`
      );
    }
    console.log("");
  });

// destruct task
task("destruct", "Destructs a GpgVerify computation")
  .addOptionalParam("index", "The GpgVerify computation index", 0, types.int)
  .setAction(async ({ index }, hre) => {
    const { ethers } = hre;
    const contract = await ethers.getContract("GpgVerify");

    const tx = await contract.destruct(index);
    console.log(
      `Destruction successful for index '${index}' (tx: ${tx.hash} ; blocknumber: ${tx.blockNumber})\n`
    );
  });

export default config;
