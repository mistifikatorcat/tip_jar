import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { TIPJAR_ADDRESS, TIPJAR_ABI } from "../utils/TipJar";
import React from "react";

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
  const [tips, setTips] = useState<Tip[]>([]);
  const [msgInput, setMsgInput] = useState("");

  

  // 1. Connect MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    const prov = new ethers.BrowserProvider(window.ethereum);
    await prov.send("eth_requestAccounts", []);
    const sig = await prov.getSigner();
    const addr = await sig.getAddress();
    setProvider(prov);
    setSigner(sig);
    setAccount(addr);

    // instantiate contract
    const ctr = new ethers.Contract(TIPJAR_ADDRESS, TIPJAR_ABI, sig);
    setContract(ctr);
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
    const tx = await contract.sendTip(msgInput, { value: ethers.parseEther("0.001") });
    await tx.wait();
    setMsgInput("");
    loadTips();
  };

  // 4. If owner, withdraw
  const withdraw = async () => {
    if (!contract) return;
    const tx = await contract.withdraw();
    await tx.wait();
    alert("Withdrawn!");
  };

  // on contract ready, load tips
  useEffect(() => {
    if (contract) loadTips();
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
          <button onClick={sendTip}>Tip 0.001 ETH</button>

          <h2>All Tips</h2>
          <ul>
            {tips.map((t, i) => (
              <li key={i}>
                <strong>{t.from}</strong> tipped <em>{t.amount}</em> at{" "}
                {new Date(t.timestamp * 1000).toLocaleString()} saying “{t.message}”
              </li>
            ))}
          </ul>

          {/* Show withdraw only if you’re the owner */}
          {account && account.toLowerCase() === process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.toLowerCase() && (
            <button onClick={withdraw} style={{ marginTop: 20 }}>
              Withdraw All
            </button>
          )}
        </>
      )}
    </div>
  );
}
