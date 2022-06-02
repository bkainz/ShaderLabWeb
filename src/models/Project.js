import Model from '../helpers/Model'
import View from '../helpers/View'
import defaultState from '../../defaultStates/project.json' assert {type: 'json'};

const table = 'projects'
Model.setup.do(`CREATE TABLE IF NOT EXISTS ${table} (
                  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                  name TEXT DEFAULT '',
                  state TEXT NOT NULL DEFAULT '{}',
                  savedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )`)

const model = new Model(table, {id: undefined, name: '', savedAt: null, state: '{}', user_id: null}, {
  async prepare(row) {
    row.state = row.state && row.state !== '{}' ? row.state : JSON.stringify(defaultState)
    row.savedAt = new Date()
  },

  normalize(record) {
    record.savedAt = new Date(record.savedAt)
  }
})
export default new View(model)