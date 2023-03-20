import { ethers } from 'hardhat';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('Hardhat Project', function () {
  it('should allow deploying a contract', async function () {
    const storageFactory = await ethers.getContractFactory('Storage');

    // @ts-ignore
    const storage = await storageFactory.deploy(10);
  });
});
