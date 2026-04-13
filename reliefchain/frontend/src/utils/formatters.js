import { ethers } from 'ethers';
export const formatEther = (wei) => ethers.formatEther(wei);
export const shortAddress = (addr) => addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : '';
export const formatDate = (ts) => new Date(ts * 1000).toLocaleDateString();
