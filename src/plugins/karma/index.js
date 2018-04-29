/*
 * file: index.js
 * author: Nozdrin-Plotnitsky Nikalay <nozrin.plotnitsky@gmail.com>
 * license: MIT
 */

import Vue from 'vue'
import {Apis, ChainConfig} from "karmajs-ws";
import Event from "./event.js"
import Asset from "./asset.js"
import Account from "./account.js"
import api from "./api.js"
import {TransactionBuilder, TransactionHelper, PrivateKey, Login, Aes, ChainStore} from "karmajs"

export default class Karma {
  static install(vue) {
    vue.prototype.$karma = Karma
    Karma.init("wss://testnet-node.karma.red",true)
  }

  static init(node = "wss://testnet-node.karma.red", autoconnect = false) {
    this.node = node;
    this.events = {
      connected: new Event()
    }

    ChainConfig.networks.Karma = {
      core_asset: 'KRMT',
      address_prefix: 'KRMT',
      chain_id: 'e81bea67cebfe8612010fc7c26702bce10dc53f05c57ee6d5b720bbe62e51bef'
    }
    ChainConfig.setPrefix('KRMT')

    if (autoconnect)
      this.connect()
  }

  static async connect() {
    if (this.events.connected.init)
      return

    let res = await Apis.instance(this.node, true).init_promise
    console.log("connected to:", res[0].network);

    this.db = api(Apis.instance().db_api());
    this.history = api(Apis.instance().history_api());
    this.network = api(Apis.instance().network_api());
    //this.crypto = api(Apis.instance().crypto_api());

    this.assets = Asset.init(this.db);
    this.accounts = Account.init(this.db);
    this.store = ChainStore;
    this.accountLogin = Login

    this.events.connected.init = true;
    this.events.connected.notify();
  }

  static subscribe(event,callback) {
    this.events[event].subscribe(callback)
  }

  static generateKeys(name, password) {
    return {
      owner: PrivateKey.fromSeed(`${name}owner${password}`),
      active: PrivateKey.fromSeed(`${name}active${password}`)
    }
  }

  static async login(name, password) {
    let privKey = this.generateKeys(name, password).active
    let genKey = privKey.toPublicKey().toString()

    let pubKey = (await Karma.accounts[name]).active.key_auths[0][0]

    if (genKey.slice(genKey.length - 50) !== pubKey.slice(pubKey.length - 50)){
      console.log("genKey", genKey, "pubKey", pubKey)
      throw new Error("The pair of login and password do not match!")
    }

    let acc = new Karma(name, privKey.toWif())
    acc.setMemoKey(privKey.toWif())

    return acc
  }

  constructor(accountName, activeKey, feeSymbol = 'krmt') {
    if (activeKey)
      this.activeKey = PrivateKey.fromWif(activeKey);

    this.initPromise = Promise.all([
      Karma.accounts[accountName],
      Karma.assets[feeSymbol]
    ]).then(params => {
      [this.account, this.feeAsset] = params;
    })
  }

  async setFeeAsset(feeSymbol) {
    await this.initPromise;
    this.feeAsset = await Karma.assets[feeSymbol]
  }

  setMemoKey(memoKey) {
    this.memoKey = PrivateKey.fromWif(memoKey);
  }

  async sendTransaction(type, operation) {
    let tx = new TransactionBuilder();
    tx.add_type_operation(type,operation)
    await tx.set_required_fees()
    tx.add_signer(this.activeKey, this.activeKey.toPublicKey().toPublicKeyString());
    return tx.broadcast();
  }

  async balances() {
    await this.initPromise;

    let balances = await Karma.db.get_account_balances(this.account.id,[]);
    return Promise.all(balances.map(balance => Karma.assets.fromParam(balance)))
  }

  async memo(toName, message) {
    if (!this.memoKey)
      throw new Error("Not set memoKey!");

    let nonce = TransactionHelper.unique_nonce_uint64(),
        to = (await Karma.accounts[toName]).options.memo_key;

    return {
      from: this.memoKey.toPublicKey().toPublicKeyString(),
      to,
      nonce,
      message: Aes.encrypt_with_checksum(this.memoKey, to, nonce, message)
    }
  }

  async transfer(toName, assetSymbol, amount, memo) {
    await this.initPromise;

    let asset = await Karma.assets[assetSymbol],
        intAmount = Math.floor(amount * 10 ** asset.precision);

    if (intAmount == 0)
      throw new Error("Amount equal 0!")

    let operation = {
      fee: this.feeAsset.toParam(),
      from: this.account.id,
      to: (await Karma.accounts[toName]).id,
      amount: asset.toParam(intAmount),
      extensions: []
    };

    if (memo)
      operation.memo = (typeof memo == "string") ? (await this.memo(toName, memo)) : memo;

    return this.sendTransaction("transfer",operation);
  }

  async createAccount(accName, ownerPubKey, activePubKey) {
    await this.initPromise;

    let operation = {
      fee: this.feeAsset.toParam(),
      registrar: this.account.id,
      referrer: this.account.id,
      referrer_percent: 10000,
      name: accName,
      owner: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[ownerPubKey, 1]],
        address_auths: []
      },
      active: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[activePubKey, 1]],
        address_auths: []
      },
      options: {
        memo_key: activePubKey,
        voting_account: "1.2.5",
        num_witness: 0,
        num_committee: 0,
        votes: []
      }
    }

    return this.sendTransaction("account_create", operation);
  }

  async proposalTransfer(fromName, toName, assetSymbol, amount, expire) {
    await this.initPromise;

    let asset = await Karma.assets[assetSymbol],
        intAmount = Math.floor(amount * 10 ** asset.precision);

    let operation = {
      fee: this.feeAsset.toParam(),
      from: (await Karma.accounts[fromName]).id,
      to: (await Karma.accounts[toName]).id,
      amount: asset.toParam(intAmount)
    }

    let tr = new TransactionBuilder();
    let transfer_op = tr.get_type_operation("transfer", operation);
    await tr.update_head_block()
    tr.add_type_operation("proposal_create", {
        proposed_ops: [{op: transfer_op}],
        fee_paying_account: this.account.id,
        expiration_time: expire.toISOString().slice(0, -5)
    });

    await tr.set_required_fees()
    tr.add_signer(this.activeKey, this.activeKey.toPublicKey().toPublicKeyString());
    return tr.broadcast();
  }


}

Vue.use(Karma,{})