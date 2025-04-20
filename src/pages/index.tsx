// pages/index.tsx

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { TIPJAR_ADDRESS, TIPJAR_ABI } from "../utils/TipJar";

type Tip = {
  from: string;
  amount: string;
  message: string;
  timestamp: number;
};

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [account, setAccount] = useState<string>();
  const [owner, setOwner] = useState<string>();
  const [tips, setTips] = useState<Tip[]>([]);
  const [msgInput, setMsgInput] = useState("");

  const connectWallet = async () => {
    const { ethereum } = window as any;
    if (!ethereum) return alert("Please install MetaMask");
    const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts[0]) return;
    const userAddress = accounts[0];
    setAccount(userAddress);

    const prov = new ethers.BrowserProvider(ethereum, "any");
    setProvider(prov);
    const sig = await prov.getSigner(userAddress);
    setSigner(sig);

    const ctr = new ethers.Contract(TIPJAR_ADDRESS, TIPJAR_ABI, sig);
    setContract(ctr);
    const ownerAddr: string = await ctr.owner();
    setOwner(ownerAddr.toLowerCase());
  };

  const loadTips = async () => {
    if (!contract) return;
    const raw = await contract.getAllTips();
    setTips(raw.map((t: any) => ({
      from: t.from,
      amount: ethers.formatEther(t.amount) + " ETH",
      message: t.message,
      timestamp: Number(t.timestamp),
    })));
  };

  const sendTip = async () => {
    if (!contract || !msgInput) return;
    const tx = await contract.sendTip(msgInput, { value: ethers.parseEther("0.001") });
    await tx.wait();
    setMsgInput("");
    loadTips();
  };

  const withdraw = async () => {
    if (!contract) return;
    const tx = await contract.withdraw();
    await tx.wait();
    alert("Withdrawn!");
  };

  useEffect(() => {
    if (contract) loadTips();
  }, [contract]);

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 space-y-6">
      {!account ? (
        <button
          onClick={connectWallet}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Connect MetaMask
        </button>
      ) : (
        <>
          <div className="text-sm text-gray-600">Connected as <span className="font-mono">{account}</span></div>

          {/* Tip Form */}
          <div className="space-y-2">
            <label className="block text-gray-700">Your Message</label>
            <input
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Say something nice…"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendTip}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Tip 0.001 ETH
            </button>
          </div>

          {/* Tips List */}
          <div>
            <h2 className="text-lg font-medium mb-2">All Tips</h2>
            <ul className="space-y-4">
              {tips.map((t, i) => (
                <li key={i} className="p-4 border border-gray-200 rounded">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(t.timestamp * 1000).toLocaleString()}
                  </div>
                  <div className="font-mono text-sm mb-1">{t.from}</div>
                  <div className="text-sm mb-2">{t.message}</div>
                  <div className="text-sm font-semibold">{t.amount}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Withdraw Button */}
          {account && owner && account.toLowerCase() === owner && (
            <button
              onClick={withdraw}
              className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Withdraw All
            </button>
          )}
        </>
      )}
    </div>
  );
}
