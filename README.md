<div>
    <div>
        <img src="https://raw.githubusercontent.com/reclaimprotocol/.github/main/assets/banners/Solana-SDK.png"  />
    </div>
</div>

## Deployments

| Chain Name     | Deployed Address                            | Explorer Link                                                                                   |
| :------------- | :------------------------------------------ | :---------------------------------------------------------------------------------------------- |
| Solana Mainnet | rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf | https://explorer.solana.com/address/rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf                 |
| Solana Testnet | rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf | https://explorer.solana.com/address/rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf?cluster=testnet |
| Solana Devnet  | rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf | https://explorer.solana.com/address/rEcLDWaVLaymz82eGr6cutosPxE6SEzw6q4pbtLuyqf?cluster=devnet  |

## Environment

### Prerequisites

1. Rust - Install via [here](https://www.rust-lang.org/tools/install)
2. Solana Tool Suite - Install via [here](https://docs.solanalabs.com/cli/install)
3. Node JS - Install via [here](https://nodejs.org/en/download)
4. yarn package manager - `npm install -g yarn`
5. Anchor - Install via [here](https://www.anchor-lang.com/docs/installation)

## Installation

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/reclaimprotocol/reclaim-solana-sdk.git
cd reclaim-solana-sdk
yarn install
```

### Setup

The setup process involves generating a new program keypair and updating the configuration files to use the newly generated program ID.

To start the setup:

```bash
yarn setup
```

The setup script will:

- Generate a new program keypair.
- Update the Anchor.toml, .solitarc.js, and lib.rs files with the new program ID.
- Modify the program's utilities and configurations.

### Build

To build the SDK, use the following command:

```bash
yarn build
```

This will compile the SDK and generate the required build artifacts.

### Deploying the Contract

Deploying the contract requires building the Anchor project and deploying it to the specified Solana network.

1. Build the Anchor project:

```bash
anchor build
```

2. Deploy the contract using the generated program keypair:

```bash
anchor deploy --program-name reclaim --program-keypair program-keypairs/reclaim-program-keypair.json
```

3. Take note of the Program ID shown in the output.

### Configuring the Program

After deploying the program, backfill the epochs to initialize the epochConfig account.

1. Run the backfill command:

```bash
yarn backfill
```

2. Take note of the Epoch config address displayed in the output

### Adding an Epoch

To add an epoch, use the `add-epoch` command, passing the `epochConfig` address as an argument.

```bash
yarn add-epoch <Epoch config address>
```

Replace `<Epoch config address>` with the actual address from the backfill step.

### Specifying the Network

By default the SDK will be interacting with Solana `devnet` Network if you want to change the Network you can set the network (cluster) for various commands by using the SOLANA_CLUSTER environment variable. The options are:

- **devnet** (default)
- **testnet**
- **mainnet**

**Example: Specifying the Network for Scripts**

To backfill epochs on testnet, run:

```bash
SOLANA_CLUSTER=testnet yarn backfill
```

To add an epoch on testnet, run:

```bash
SOLANA_CLUSTER=testnet yarn add-epoch <Epoch config address>
```

**Example: Deploying the Contract on Different Networks**

To deploy the contract on testnet:

1. First replace the lines in `Anchor.toml`:

   ```bash
   [programs.devnet]
   cluster = "devnet"
   ```

   with:

   ```bash
   [programs.testnet]
   cluster = "testnet"
   ```

2. Run the `anchor deploy` command with the `--provider.cluster` option.

   ```bash
   anchor deploy --provider.cluster testnet --program-name reclaim --program-keypair program-keypairs/reclaim-program-keypair.json
   ```

By following these steps, you can easily configure the SDK and deploy the Reclaim program on any Solana network.

### Repository directory

- programs/reclaim - The anchor smart contract code for reclaim program
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
