import { ethers } from 'ethers';
// TODO: import ABIs after contract compilation
// import DonationVaultABI from '../../artifacts/contracts/core/DonationVault.sol/DonationVault.json';

export function getDonationVault(signerOrProvider) {
  return new ethers.Contract(
    process.env.REACT_APP_DONATION_VAULT_ADDRESS,
    [], // TODO: replace with DonationVaultABI.abi
    signerOrProvider
  );
}
