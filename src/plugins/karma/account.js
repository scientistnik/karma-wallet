/*
 * file: account.js
 * author: Nozdrin-Plotnitsky Nikalay <nozrin.plotnitsky@gmail.com>
 * license: MIT
 */

export default class Account {
  static init(db) {
    if (this.instance)
      return this.instance

    this.db = db
    this.map = new Map()
    this.instance = new Proxy(this,this)
    return this.instance;
  }

  static get(obj, name) {
    if (obj[name])
      return obj[name]

    return this.getAccout(name)
  }

  static async getAccout(_name) {
    let name = _name.toLowerCase()

    if (this.map.has(name))
      return this.map.get(name)

    let acc = await this.db.get_account_by_name(name);

    if (!acc || acc.name !== name)
      throw new Error(`Not found account ${name}! Blockchain return ${acc ? acc.name : acc}`);

    this.map.set(name, new this(acc))
    return this.map.get(name)
  }

  static async id(id) {

    let acc = await this.db.get_accounts([id])
    console.log(acc)
  }

  constructor(rpcObj) {
    Object.assign(this, rpcObj)
  }
}