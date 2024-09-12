<div>
    <div>
        <img src="https://raw.githubusercontent.com/reclaimprotocol/.github/main/assets/banners/Solana-SDK.png"  />
    </div>
</div>

## Deployments

| Chain Name | Deployed Address | Explorer Link |
|:-----------|:-----------------|:--------------|
| Solana Mainnet | rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf | https://explorer.solana.com/address/rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf|
| Solana Testnet | rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf | https://explorer.solana.com/address/rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf?cluster=testnet|
| Solana Devnet | rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf | https://explorer.solana.com/address/rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf?cluster=devnet

## Environment

### Prerequisites

1. Rust - Install via [here](https://www.rust-lang.org/tools/install)
2. Solana Tool Suite - Install via [here](https://docs.solanalabs.com/cli/install)
3. Node JS - Install via [here](https://nodejs.org/en/download)
4. yarn package manager - `npm install -g yarn`
5. Anchor - Install via [here](https://www.anchor-lang.com/docs/installation)

### Preparing the installation

- `yarn install` for installing the packages
- `yarn build` for building the solana sdk and the program
- `yarn test` for testing the suites
- `yarn backfill` for filling the previously created epochs
- `yarn add-epoch` to add a new epoch
- `yarn init-airdrop` to initialize the airdrop program
- `yarn fe` for starting the front end

### Repository directory

- programs/reclaim - The anchor smart contract code for reclaim program
- programs/airdrop - An example use case of utilizing reclaim program
- airdrop-frontend - A minimalistic front end application to test proofs and airdrops
- sdk - The auto generated SDK folder using solita
- scripts - Automated scripts to speed up certain initializing processes
- program-keypairs - The keypairs that are stored for vanity addresses
- tests - The test suites that are ran during `anchor test`

## Contributing to Our Project

We're excited that you're interested in contributing to our project! Before you get started, please take a moment to review the following guidelines.

## Code of Conduct

Please read and follow our [Code of Conduct](https://github.com/reclaimprotocol/.github/blob/main/Code-of-Conduct.md) to ensure a positive and inclusive environment for all contributors.

## Security

If you discover any security-related issues, please refer to our [Security Policy](https://github.com/reclaimprotocol/.github/blob/main/SECURITY.md) for information on how to responsibly disclose vulnerabilities.

## Contributor License Agreement

Before contributing to this project, please read and sign our [Contributor License Agreement (CLA)](https://github.com/reclaimprotocol/.github/blob/main/CLA.md).

## Indie Hackers

For Indie Hackers: [Check out our guidelines and potential grant opportunities](https://github.com/reclaimprotocol/.github/blob/main/Indie-Hackers.md)

## License

This project is licensed under a [custom license](https://github.com/reclaimprotocol/.github/blob/main/LICENSE). By contributing to this project, you agree that your contributions will be licensed under its terms.

Thank you for your contributions!
