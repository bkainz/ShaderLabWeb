import db from '../helpers/database'

function extendClause(segments, ...additions) {
  return Array.isArray(segments) ? [...segments, ...additions]
       :                segments ? [segments, ...additions]
       :                           additions
}

function isDate(value){ return value && Date.prototype.isPrototypeOf(value) }
function isBuffer(value){ return value && Buffer.prototype.isPrototypeOf(value) }

function areEqualDates(d1, d2){ return isDate(d1) && isDate(d2) && d1.getTime() === d2.getTime() }
function areEqualBuffers(b1, b2){ return isBuffer(b1) && isBuffer(b2) && b1.compare(b2) === 0 }
function areEqualValues(v1, v2){ return areEqualDates(v1, v2) || areEqualBuffers(v1, v2) || v1 === v2 }

function isRecord(value){ return value && Object.getPrototypeOf(value) === Object.prototype }
function isAssociation(value){ return Array.isArray(value) || isRecord(value )}

function areEqualRecordsExceptForAssociations(r1, r2) {
  if (!isRecord(r1) || !isRecord(r2))
    return false

  for (const key in r1)
    if (!(key in r2) || (!isAssociation(r1[key]) || !isRecord(r2[key])) && !areEqualValues(r1[key], r2[key]))
      return false

  for (const key in r2)
    if (!(key in r1))
      return false

  return true
}

function mergeRowIntoRecord(record, row) {
  field:
  for (const key in row)
    if (isAssociation(record[key]) && isRecord(row[key]))
      if (Array.isArray(record[key])) {
        for (let idx = 0; idx < record[key].length; idx += 1)
          if (areEqualRecordsExceptForAssociations(record[key][idx], row[key])) {
            record[key][idx] = mergeRowIntoRecord(record[key][idx], row[key])
            continue field
          }
        record[key].push(row[key])
      }
      else
        record[key] = areEqualRecordsExceptForAssociations(record[key], row[key]) ? mergeRowIntoRecord(record[key], row[key])
                                                                                  : [record[key], row[key]]
  return record
}

export default class {
  constructor(model, {associations = {}, query = {}, extensions = {}} = {}, parent = model, name = 'cte') {
    this.model = model
    this.associations = associations
    this.extensions = extensions
    this.parent = parent
    this.table = parent.table+(name && '_'+name)

    for (const method in extensions)
      this[method] = this[method] ? extensions[method].bind(this, this[method].bind(this))
                                  : extensions[method]

    this.columns = []
    const CTEs = []
    const select = {}

    if (parent !== model) CTEs.push(parent.CTEs)

    for (const column of parent.columns)
      select[column] = select[column] || parent.table + '.' + column

    for (const name in this.associations) {
      const [association, keys] = this.associations[name]
      const table = name.split('.').join('_')

      CTEs.push(association.CTEs)

      const on = {}; for (const ownKey in keys) on[keys[ownKey]] = [parent.table, ownKey]
      query.join = query.join || {}
      query.join[table] = {table: association.table, on}

      for (const column of association.columns) {
        const columnAlias = column in association.model.nullAttributes ? table+'|'+column : table+'_'+column
        select[columnAlias] = select[columnAlias] || table + '.' + column
      }
    }
    query.select = extendClause(query.select, select)

    for (const segment of query.select)
      if (typeof segment === 'object' && segment && Object.getPrototypeOf(segment) === Object.prototype)
        for (const column in segment)
          this.columns.push(column)

    const orderClause = query.orderBy ? db.build.orderBy(query.orderBy, parent.table)
                                      : 'ORDER BY '+model.primaryKey.map(key => db.format('?? ASC', model.table+'.'+key)).join(', ')
    query.select = extendClause(query.select, db.format(`dense_rank() OVER (${orderClause}) AS row_number`))
    delete query.orderBy

    CTEs.push(db.format(`?? AS (${db.build.select(parent.table, query)})`, this.table))

    this.CTEs = CTEs.join(', ')
  }

  derive(name, options) {
    options.extensions = {...this.extensions, ...options.extensions}
    return new this.constructor(this.model, options, this, name)
  }

  build(overwrite = {}) {
    const record = this.parent.build(overwrite)
    for (const name in this.associations) {
      const association = this.associations[name]
      const path = name.split('.'), field = path.pop()
      const owner = path.reduce((o, node) => o[node], record)
      owner[field] = association[2] === 'many' && !Array.isArray(owner[field]) ? association[0].model.isNull(owner[field]) ? [] : [owner[field]]
                                                                               : owner[field]
      if (Array.isArray(owner[field]))
        for (let idx = 0; idx < owner[field].length; idx += 1)
          owner[field][idx] = association[0].build(owner[field][idx])
      else
        owner[field] = association[0].build(owner[field])
    }
    return record
  }

  buildFromRecord(where) {
    return this.getOne(where).then(record => {
      for (const key of this.model.primaryKey) delete record[key]
      return record
    })
  }

  augmentRecord(record, columns) {
    const augmented = {}
    let noChanges = true
    for (const column in record)
      augmented[column] = record[column]
    for (const column in columns)
      if (column in record && columns[column] !== augmented[column]) {
        noChanges = false
        augmented[column] = columns[column]
      }
    return [augmented, noChanges]
  }

  selectSQL(columns = '*', query = {}) {
    query.select = extendClause(query.select, {row_number: 'row_number'})
    query.orderBy = extendClause(query.orderBy, {row_number: 'ASC'})
    return {tables: this.CTEs, select: db.build.select(this.table, {...query, select: columns})}
  }

  select(columns = '*', query = {}) {
    const {tables, select} = this.selectSQL(columns, query)
    return db.get(`WITH ${tables} ${select}`)
  }

  selectOne(columns = '*', query = {}) {
    return this.select(columns, {...query, limit: 1}).then(rows => rows[0])
  }

  get(where = {}, query = {}) {
    query.select = extendClause(query.select || '*', {row_number: 'row_number'})
    query.orderBy = extendClause(query.orderBy, {row_number: 'ASC'})
    return db.get(`WITH ${this.CTEs} ${db.build.select(this.table, {...query, where})}`)
             .then(rows => {
               const records = {}
               for (const row of rows) {
                 const recordRow = {}
                 for (const column in row) {
                   if (column === 'row_number') continue
                   const tableField = column.split('|'), field = tableField.pop()
                   const path = tableField[0] ? tableField[0].split('_') : []
                   const owner = path.reduce((o, node) => o[node] = o[node] || {}, recordRow)
                   owner[field] = row[column]
                 }

                 const primaryKey = 'pk|'+this.model.primaryKey.map(key => row[key]).join('|')
                 records[primaryKey] = records[primaryKey] ? mergeRowIntoRecord(records[primaryKey], recordRow)
                                                           : recordRow
               }

               const result = []
               for (const primaryKey in records) result.push(this.build(records[primaryKey]))
               return result
             })
  }

  getOne(where = {}, query = {}) {
    return this.get(where, {...query, limit: 1})
               .then(records => records[0] || this.build())
  }

  exists(where = {}, query = {}) {
    return db.get(`WITH ${this.CTEs} SELECT EXISTS(${db.build.select(this.table, {...query, where, limit: 1})}) AS e`)
             .then(result => !!result[0].e)
  }

  save(rows = []) {
    if (!rows.length) return Promise.resolve([])
    return Promise.all(rows.map(row => this.model.prepare(row)))
                  .then(rows => db.run(db.build.upsert(this.model.table, rows, this.model.primaryKey)))
                  .then(result => 'id' in rows[0] ? rows.map(row => row.id) : rows.map((row, idx) => result.lastID-(rows.length-1)+idx))
  }

  saveOne(row) {
    return this.save([row]).then(ids => ids[0])
  }

  delete(where = {}, query = {}) {
    return db.run(db.build.delete(this.model.table, {...query, where}))
  }
}