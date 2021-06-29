function mapValue(value) {
  return Array.isArray(value)                ? value.map(mapValue)
       : value && value.constructor === Date ? new Date(value)
       :                                       value
}

function mapId(id) {
  return Array.isArray(id) ? id.map(mapId)
       : id === 'null'     ? null
       :                     id
}

export default {
  process(params) {
    const processed = {}
    for (const key in params) {
      const name = key.endsWith('[]') ? key.slice(0, -2) : key
      processed[name] = name === 'id' || name.endsWith('_id') ? mapId(params[key])
                                                              : mapValue(params[key])
    }
    return processed
  }
}