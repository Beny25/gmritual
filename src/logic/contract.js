export const CONTRACT = "0x725Ccb4ddCB715f468b301395Dfd1b1efDb5308A";

export const ABI = [
  {
    name: "performRitual",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "newMessage", type: "string" }],
    outputs: []
  },
  {
    name: "fee",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  }
];
