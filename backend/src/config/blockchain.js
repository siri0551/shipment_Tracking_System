const { ethers } = require("ethers");
const contractData = require("./contract.json");

const STATUS_MAP = {
  Created: 0,
  "Picked Up": 1,
  "In Transit": 2,
  Warehouse: 3,
  "Out for Delivery": 4,
  Delivered: 5,
  Cancelled: 6,
};

const STATUS_REVERSE = Object.fromEntries(Object.entries(STATUS_MAP).map(([k, v]) => [v, k]));

let provider, signer, contract;

const init = () => {
  if (contract) return contract;

  provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL || "http://127.0.0.1:7545");
  signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  contract = new ethers.Contract(contractData.address, contractData.abi, signer);
  return contract;
};

// Feature 3 & 4: Register shipment on blockchain
const registerShipmentOnChain = async (trackingId, carrierWallet, receiverWallet) => {
  const c = init();
  const tx = await c.createShipment(
    trackingId,
    carrierWallet || ethers.ZeroAddress,
    receiverWallet || ethers.ZeroAddress
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find((log) => {
    try { return c.interface.parseLog(log)?.name === "ShipmentCreated"; } catch { return false; }
  });
  const parsed = c.interface.parseLog(event);
  return { txHash: receipt.hash, contractShipmentId: Number(parsed.args.id) };
};

// Feature 4: Update status on blockchain
const updateStatusOnChain = async (contractShipmentId, status, note = "") => {
  const c = init();
  const statusCode = STATUS_MAP[status];
  if (statusCode === undefined) throw new Error(`Invalid status: ${status}`);
  const tx = await c.updateStatus(contractShipmentId, statusCode, note);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
};

// Feature 4: Transfer ownership on blockchain
const transferOwnershipOnChain = async (contractShipmentId, newCarrierWallet) => {
  const c = init();
  const tx = await c.transferOwnership(contractShipmentId, newCarrierWallet);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
};

// Feature 4: Confirm delivery on blockchain
const confirmDeliveryOnChain = async (contractShipmentId) => {
  const c = init();
  const tx = await c.confirmDelivery(contractShipmentId);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
};

// Feature 4: Cancel shipment on blockchain
const cancelShipmentOnChain = async (contractShipmentId) => {
  const c = init();
  const tx = await c.cancelShipment(contractShipmentId);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
};

// Feature 3: Get on-chain shipment events
const getShipmentEventsOnChain = async (contractShipmentId) => {
  const c = init();
  const events = await c.getShipmentEvents(contractShipmentId);
  return events.map((e) => ({
    status: STATUS_REVERSE[Number(e.status)],
    updatedBy: e.updatedBy,
    timestamp: new Date(Number(e.timestamp) * 1000).toISOString(),
    note: e.note,
  }));
};

// Feature 3: Get on-chain shipment by trackingId
const getShipmentOnChain = async (trackingId) => {
  const c = init();
  const s = await c.getShipmentByTrackingId(trackingId);
  return {
    id: Number(s.id),
    trackingId: s.trackingId,
    sender: s.sender,
    carrier: s.carrier,
    receiver: s.receiver,
    status: STATUS_REVERSE[Number(s.status)],
    createdAt: new Date(Number(s.createdAt) * 1000).toISOString(),
    updatedAt: new Date(Number(s.updatedAt) * 1000).toISOString(),
  };
};

module.exports = {
  registerShipmentOnChain,
  updateStatusOnChain,
  transferOwnershipOnChain,
  confirmDeliveryOnChain,
  cancelShipmentOnChain,
  getShipmentEventsOnChain,
  getShipmentOnChain,
};
