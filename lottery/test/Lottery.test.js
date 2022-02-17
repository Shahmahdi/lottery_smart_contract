const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const { abi, evm } = require("../compile");

const web3 = new Web3(ganache.provider());

let accounts;
let deployedLottery;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  deployedLottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery", () => {
  it("deploys a contract", () => {
    assert.ok(deployedLottery.options.address);
  });

  it("allows one account to enter", async () => {
    await deployedLottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether")
    });

    const players = await deployedLottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.ok(accounts[0], players[0]);
    assert.ok(1, players.length);
  });

  it("allows multiple accounts to enter", async () => {
    await deployedLottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether")
    });

    await deployedLottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether")
    });

    await deployedLottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether")
    });

    const players = await deployedLottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.ok(accounts[0], players[0]);
    assert.ok(accounts[1], players[1]);
    assert.ok(accounts[2], players[2]);
    assert.ok(3, players.length);
  });

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await deployedLottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("only manager can call pick winner", async () => {
    try {
      await deployedLottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("sends money to the winner and resets the players array", async () => {
    await deployedLottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether")
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await deployedLottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei("1.8", "ether"));
  });
});

