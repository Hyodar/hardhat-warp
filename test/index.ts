import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { useEnvironment } from './helpers';

chai.use(chaiAsPromised);

describe('Warp plugin', function () {
  describe('HRE extensions', function () {
    useEnvironment('hardhat-project');

    it('should extend hardhat runtime environment', function () {
      // TODO continue
    });

    it('should modify some ethers members', function () {
      const ethers = this.env.ethers;

      expect(ethers.constants.AddressZero).to.be.eq(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      );
      // TODO continue
    });
  });

  describe('Contract management', function () {
    useEnvironment('hardhat-project');

    it('should allow basic management', async function () {
      await this.env.run('test');
    });
  });
});
