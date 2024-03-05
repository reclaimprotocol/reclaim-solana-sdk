# Reclaim Protocol

## Prerequisites

1. Rust - Install via [here](https://www.rust-lang.org/tools/install)
2. Solana Tool Suite - Install via [here](https://docs.solanalabs.com/cli/install)
3. Node JS - Install via [here](https://nodejs.org/en/download)
4. yarn package manager - `npm install -g yarn`
5. Anchor - Install via [here](https://www.anchor-lang.com/docs/installation)

## Preparing the installation

- `yarn install` for installing the packages
- `yarn build` for building the sdk and the program
- `yarn test` for testing the suites
- `yarn backfill` for filling the previously created epochs
- `yarn add-epoch` to add a new epoch
- `yarn init-airdrop` to initialize the airdrop program
- `yarn fe` for starting the front end

## Repository directory

- programs/reclaim - The anchor smart contract code for reclaim program
- programs/airdrop - An example use case of utilizing reclaim program
- airdrop-frontend - A minimalistic front end application to test proofs and airdrops
- sdk - The auto generated SDK folder using solita
- scripts - Automated scripts to speed up certain initializing processes
- program-keypairs - The keypairs that are stored for vanity addresses
- tests - The test suites that are ran during `anchor test`
