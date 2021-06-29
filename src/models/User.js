import Model from '../helpers/Model'
import View from '../helpers/View'
import bcrypt from 'bcrypt'

const table = 'users'
Model.setup.do(`CREATE TABLE IF NOT EXISTS ${table} (
                  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                  username TEXT DEFAULT '' UNIQUE,
                  password BLOB DEFAULT '',
                  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )`)

const model = new Model(table, {id: undefined, username: '', password: ''}, {
  async prepare(row) {
    delete row.isRoot

    if (row.password === '')
      delete row.password
    else
      row.password = await bcrypt.hash(row.password, 12)
  },

  normalize(record) {
    record.isRoot = record.id === 1
    record.password = ''
  }
})
export default new View(model)