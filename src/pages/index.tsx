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

  // 1. Connect MetaMask
  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        alert("Please install MetaMask");
        return;
      }

      // Request the user's accounts
      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length === 0) {
        console.log("No accounts found");
        return;
      }
      const userAddress = accounts[0];
      setAccount(userAddress);

      // Create an Ethers provider that doesn't enforce a specific network
      const prov = new ethers.BrowserProvider(ethereum, "any");
      setProvider(prov);

      // Explicitly get the signer for that address
      const sig = await prov.getSigner(userAddress);
      setSigner(sig);

      // Instantiate the contract with the signer
      const ctr = new ethers.Contract(TIPJAR_ADDRESS, TIPJAR_ABI, sig);
      setContract(ctr);

      // Fetch and store the owner address
      const ownerAddr: string = await ctr.owner();
      setOwner(ownerAddr.toLowerCase());
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      alert("Connection failed. Check console for details.");
    }
  };

  // 2. Fetch all tips
  const loadTips = async () => {
    if (!contract) return;
    const raw: any[] = await contract.getAllTips();
    const parsed = raw.map((t) => ({
      from: t.from,
      amount: ethers.formatEther(t.amount) + " ETH",
      message: t.message,
      timestamp: Number(t.timestamp),
    }));
    setTips(parsed);
  };

  // 3. Send a tip
  const sendTip = async () => {
    if (!contract || !msgInput) return;
    const tx = await contract.sendTip(msgInput, {
      value: ethers.parseEther("0.001"),
    });
    await tx.wait();
    setMsgInput("");
    loadTips();
  };

  // 4. Withdraw (owner only)
  const withdraw = async () => {
    if (!contract) return;
    const tx = await contract.withdraw();
    await tx.wait();
    alert("Withdrawn!");
  };

  // Load tips whenever the contract is set
  useEffect(() => {
    if (contract) {
      loadTips();
    }
  }, [contract]);

  return (
    <div style={{ padding: 20 }}>
      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <>
          <div>Connected as: {account}</div>

          <h2>Leave a Tip</h2>
          <input
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            placeholder="Your message"
          />
          <button onClick={sendTip} style={{ marginLeft: 8 }}>
            Tip 0.001 ETH
          </button>

          <h2 style={{ marginTop: 24 }}>All Tips</h2>
          <ul>
            {tips.map((t, i) => (
              <li key={i} style={{ marginBottom: 12 }}>
                <strong>{t.from}</strong> tipped <em>{t.amount}</em> at{" "}
                {new Date(t.timestamp * 1000).toLocaleString()} saying “
                {t.message}”
              </li>
            ))}
          </ul>

          {/* Show withdraw only if you're the on‑chain owner */}
          {account &&
            owner &&
            account.toLowerCase() === owner && (
              <button
                onClick={withdraw}
                style={{ marginTop: 20, background: "#f44336", color: "#fff" }}
              >
                Withdraw All
              </button>
            )}
        </>
      )}
    </div>
  );
}
