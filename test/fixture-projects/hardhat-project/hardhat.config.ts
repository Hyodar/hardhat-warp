import { HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '../../../src';

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  starknet: {
    network: 'integrated-devnet',
  },
  networks: {
    integratedDevnet: {
      url: `http://127.0.0.1:5050`,
      // venv: "path/to/venv" <- for env with installed starknet-devnet (created with e.g. `python -m venv path/to/venv`)
      venv: '../../../venv',
      args: ['--seed', '0', '--timeout', '10000'],
      stdout: 'stdout.log', // <- logs redirected to log file
      stderr: 'STDERR', // <- logs stderr to the terminal
    },
  },
};

export default config;
