import "./App.css";
import { useEffect, useState } from "react";
import web3 from "./web3";
import lottery from "./lottery";
import { CircularProgress } from "@mui/material";

function App() {
  const [loading, setLoading] = useState(true);
  const [managerAddress, setManagerAddress] = useState("");
  const [playersAddresses, setPlayersAddresses] = useState([]);
  const [totalBalance, setTotalBalance] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [etherAmount, setEtherAmount] = useState("");
  const [pickWinnerLoading, setPickWinnerLoading] = useState(false);
  const [winnerAddress, setWinnerAddress] = useState("");

  useEffect(() => {
    // web3.eth.getAccounts().then(r => console.log(r));
    (async () => {
      setLoading(true);
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      console.log(`manager`, manager, players, balance);
      setManagerAddress(manager);
      setPlayersAddresses(players);
      setTotalBalance(balance);
      setLoading(false);
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setWinnerAddress("");
    setFormLoading(true);
    const accounts = await web3.eth.getAccounts();
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(etherAmount, "ether")
    });
    setFormLoading(false);
  };

  const pickWinner = async (e) => {
    e.preventDefault();
    setPickWinnerLoading(true);
    const accounts = await web3.eth.getAccounts();
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
    const winner = await lottery.methods.winnerAddress().call();
    setWinnerAddress(winner);
    setPickWinnerLoading(false);
  };

  return (
    <div>
      {!loading ? (
        <>
          <h2>Lottery Contract</h2>
          <p>{`This contract is managed by ${managerAddress}`}</p>
          <p>{`There are currently ${
            playersAddresses.length
          } people entered, competing to win ${web3.utils.fromWei(
            totalBalance,
            "ether"
          )} ether!`}</p>
          <hr />
          <form onSubmit={onSubmit}>
            <h4>Want to try your luck?</h4>
            <div>
              <label>Amount of ether to enter: </label>
              <input
                value={etherAmount}
                onChange={(e) => setEtherAmount(e.target.value)}
              />
            </div>
            <button>{formLoading ? <CircularProgress /> : "Enter"}</button>
          </form>

          <hr />
          <hr />

          <h4>Ready to pick winner?</h4>
          <button onClick={pickWinner}>
            {pickWinnerLoading ? <CircularProgress /> : "Pick a winner!"}
          </button>
          {winnerAddress && <h5>{`The winner address is ${winnerAddress}`}</h5>}
        </>
      ) : (
        <p>Getting data...</p>
      )}
    </div>
  );
}

export default App;
