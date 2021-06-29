import path from 'path'
import sqlite3 from 'sqlite3'
import {open} from 'sqlite'
import exitHandler from './exitHandler'
import queryBuilder from './database/queryBuilder'

let setConnection
const connection = new Promise(resolve => setConnection = resolve)

exitHandler.register('database', () => connection.then(connection => connection.close()))

open({filename: path.join(global.rootDir, 'data/db.sqlite'), driver: sqlite3.Database}).then(setConnection)

class FormattedQuery {
  constructor(sql){ this.sql = sql }
  toSqlString(){ return this.sql }
  toString(){ return this.sql }
}

export default {
  build: queryBuilder,
  format(sql, ...values) {
    return new FormattedQuery(queryBuilder.format(sql, ...values))
  },
  run(...args) {
    return connection.then(connection => connection.run(...args))
  },
  get(...args) {
    return connection.then(connection => connection.all(...args))
  }
}