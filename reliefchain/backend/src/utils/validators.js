exports.isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
exports.isValidCID = (cid) => cid && cid.length > 10;
