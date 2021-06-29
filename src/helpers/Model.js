import db from '../helpers/database'

class Model {
  constructor(table, nullAttributes, {prepare = null, normalize = null, primaryKey = ['id']} = {}) {
    this.table = table
    this.nullAttributes = Object.freeze(nullAttributes)
    this.primaryKey = primaryKey
    this.columns = Object.freeze(Object.keys(this.nullAttributes))
    this._prepare = prepare
    this._normalize = normalize
  }

  isNull(record) {
    for (const key of this.primaryKey) if (record && record[key] && record[key] !== this.nullAttributes[key]) return false
    return true
  }

  async prepare(row) {
    this._prepare && await this._prepare(row)
    return row
  }

  build(overwrite = {}) {
    const record = Object.assign({}, this.nullAttributes, overwrite)

    for (const name in record)
      if (record[name] === undefined)
        delete record[name]

    this._normalize && this._normalize(record)
    return record
  }
}

let conclusionPromise = null, concludeSetup
const awaitedQueries = new Set()
Model.setup = {
  do(...args) {
    const query = db.run(...args)
    awaitedQueries.add(query)
    if (!conclusionPromise) conclusionPromise = new Promise(resolve => concludeSetup = resolve)
    return query.finally(() => {
      awaitedQueries.delete(query)
      // wait for next tick to take into account setups that
      // will be registered in this tick via this.setUp(...).then()
      process.nextTick(() => awaitedQueries.size || (conclusionPromise = null, concludeSetup()))
    })
  },
  get isDoneUptoThisPoint() {
    return Promise.all([...awaitedQueries])
  },
  get isDone() {
    return conclusionPromise || Promise.resolve()
  }
}

export default Model