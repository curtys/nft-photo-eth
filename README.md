# Ethereum Photo NFT platform

Prototype for demonstrating the feasibility of implementing an NFT platform for photographers on the Ethereum blockchain with an ArchiMate architecture model.

Implemented functionalities include:
* Creating of an ownership NFT (ERC-721) for a digital asset
* Creation of usage licences for above asset in the from of license tokens (ERC-20)
* Transfer of license tokens
* Query functionality

Please note that this is a prototype for demonstration and evaluation purposes of the scenario and architecture.
This platform has also been realized for [Hyperledger Fabric](https://github.com/fhaer/nft-photo-hlf).

## Requirements

* [Node.js](https://nodejs.org/en/) >= 14.17.3
* [Embark](https://github.com/embarklabs/embark/tree/master/packages/embark#readme)
* [Metamask](https://metamask.io)

## Running the application

* Install the project dependencies: `npm install`
* The project uses Embark for blockchain interaction. Start the application stack in development mode with `embark run`. This will compile the smart contracts, build the dApp, start a test blockchain and deploy the application.
* In Metamask [configure a custom network](https://metamask.zendesk.com/hc/en-us/articles/360043227612-How-to-add-custom-Network-RPC-and-or-Block-Explorer) for Embark with the endpoint http://localhost:8555.
* Import the test wallet in Metamask using the Mnemonic (secret recovery phrase) configured in `config/blockchain.js` (by default the development environment is used). Metamask is now set-up to use the accounts of the local test blockchain.
* The application webserver is available on http://loclahost:8000
