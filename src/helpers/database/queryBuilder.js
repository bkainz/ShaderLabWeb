import sqlstring from 'sqlstring-sqlite'

function clause(segments = [], forColumns) {
  segments = Array.isArray(segments) ? segments : [segments]

  const clause = []
  for (const segment of segments)
    switch (typeof segment) {
      case 'string':
        clause.push(segment)
        break
      case 'object':
        if (segment === null) {
          // fall through
        }
        else if (segment.toSqlString) {
          clause.push(segment)
          break
        }
        else {
          const columns = forColumns(segment)
          columns && clause.push(columns)
          break
        }
        // fall through
      default:
        throw new Error('sql clause segment no string or object')
    }
  return clause
}

export default {
  select(table, {select = [], join, where, orderBy, offset, limit}) {
    select = Array.isArray(select) ? select : [select]

    const columns = select.length ? clause(select, select => {
                                      const columns = []
                                      for (const alias in select) {
                                        const column = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(select[alias]) ? table+'.'+select[alias] : select[alias]
                                        columns.push(this.format('?? AS ??', column, alias))
                                      }
                                      return columns.join(', ')
                                    })
                                  : ['*']

    return 'SELECT '+columns.join(', ')+'\n'
         + this.from(table, join)+'\n'
         + this.where(where, table)+'\n'
         + this.orderBy(orderBy, table)+'\n'
         + this.limit(offset, limit)
  },

  upsert(table, rows, primaryKey) {
    const columns = Object.keys(rows[0])
    return 'INSERT INTO '+this.format('?? (??) VALUES ? ', table, columns, rows.map(row => Object.values(row)))
         + 'ON CONFLICT ('+primaryKey.map(key => this.format(`??`, key)).join(', ')+') '
         + 'DO UPDATE SET '+columns.map(column => this.format(`?? = excluded.??`, column, column)).join(', ')
  },

  delete(table, {join, where, orderBy, offset, limit}) {
    const nJoins = join ? Object.keys(join).length : 0
    return 'DELETE '+(nJoins ? this.format('??', table) : '')
         + this.from(table, join)+'\n'
         + this.where(where, table)+'\n'
         + (nJoins ? '' : this.orderBy(orderBy, table))+'\n'
         + (nJoins ? '' : this.limit(offset, limit))
  },

  from(table, joins = {}) {
    return 'FROM '+this.format('??', table)
         + Object.entries(joins).map(([alias, {table = alias, on}]) => {
             on = Object.entries(on).map(([key, [ownerTable, foreignKey]]) => this.format('?? = ??', alias+'.'+key, ownerTable+'.'+foreignKey)).join(' AND ')
             return this.format(`LEFT JOIN ?? AS ?? ON ${on}`, table, alias)
           }).join('\n')
  },

  where(segments, table) {
    const where = clause(segments, columns => {
      const where = []
      for (const column in columns) {
        const name = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column) ? table+'.'+column : column
        const definition = Array.isArray(columns[column]) ? columns[column] : [columns[column]]
        const nullIdx = definition.indexOf(null)
        const isNull = nullIdx !== -1
        if (isNull) definition.splice(nullIdx, 1)
        const template = definition.length === 1 ? definition[0].toSqlString ? '?? ?' : '?? = ?' : '?? IN (?)'
        const nullValue = isNull ? this.format('?? IS NULL', name) : ''
        const noNullValue = definition.length ? this.format(template, name, definition) : ''
        const filter = nullValue && noNullValue ? '('+nullValue+' OR '+noNullValue+')' : nullValue || noNullValue
        filter && where.push(filter)
      }
      return where.join(' AND ')
    })
    return where.length ? 'WHERE '+where.join(' ') : ''
  },

  orderBy(segments, table) {
    const orderBy = clause(segments, columns => {
      const orderBy = []
      for (const column in columns) {
        const name = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column) ? this.format('??', table+'.'+column) : column
        orderBy.push(name+' '+columns[column])
      }
      return orderBy.join(', ')
    })
    return orderBy.length ? 'ORDER BY '+orderBy.join(' ') : ''
  },

  limit(offset = 0, limit = 0) {
    return offset && limit ? `LIMIT ${offset}, ${limit}`
         : offset          ? `LIMIT ${offset}, 18446744073709551615`
         :           limit ? `LIMIT ${limit}`
         :                   ''
  },

  format(sql, ...values) {
    return sqlstring.format(sql, values)
  }
}