const rConstInt = /const\s+int\s+(\w+)\s*=\s*([^\s;]+)\s*;/g
const rUniform = /uniform\s+/g
const rNamedStruct = /struct\s+(\w+)\s*{\s*/g

const rType = /(\w+)\s+/y
const rStruct = /struct(?:\s+(\w+))?\s*{\s*/y
const rStructEnd = /\s*}\s*/y
const rName = /(\w+)(?:\[([^\]]+)])?\s*(?:\/\*\s*attach to:([^*]+)\*\/)?\s*;\s*/y

function parseType(string, ptr) {
  rType.lastIndex = ptr
  const typeMatch = rType.exec(string)
  return typeMatch && {type: typeMatch[1], ptr: rType.lastIndex}
}

function parseStruct(string, ptr) {
  rStruct.lastIndex = ptr
  const structMatch = rStruct.exec(string)
  if (!structMatch) return null
  ptr = rStruct.lastIndex

  const fieldsMatch = parseStructFields(string, ptr)
  if (!fieldsMatch) return null

  return {type: {name: structMatch[1], fields: fieldsMatch.fields},
          ptr: fieldsMatch.ptr}
}

function parseStructFields(string, ptr) {
  const fields = []
  let fieldMatch
  while (fieldMatch = parseField(string, ptr)) {
    fields.push(fieldMatch)
    ptr = fieldMatch.ptr
  }

  rStructEnd.lastIndex = ptr
  const structEndMatch = rStructEnd.exec(string)
  if (!structEndMatch) return null

  return {fields, ptr: rStructEnd.lastIndex}
}

function parseName(string, ptr) {
  rName.lastIndex = ptr
  const match = rName.exec(string)
  return match && {name: match[1], length: match[2], defaultAttachment: match[3] && match[3].trim(), ptr: rName.lastIndex}
}

function parseField(string, ptr, allowStruct) {
  const typeMatch = allowStruct && parseStruct(string, ptr) || parseType(string, ptr)
  if (!typeMatch) return null

  const nameMatch = parseName(string, typeMatch.ptr)
  if (!nameMatch) return null

  return {name: nameMatch.name,
          type: typeMatch.type,
          length: nameMatch.length,
          defaultAttachment: nameMatch.defaultAttachment,
          ptr: nameMatch.ptr}
}

function parseUniform(string, ptr) {
  rUniform.lastIndex = ptr
  const uniformMatch = rUniform.exec(string)
  if (!uniformMatch) return null
  ptr = rUniform.lastIndex

  const fieldMatch = parseField(string, ptr, true)
  if (!fieldMatch) return null

  return fieldMatch
}

function parseNamedStruct(string, ptr) {
  rNamedStruct.lastIndex = ptr
  const structMatch = rNamedStruct.exec(string)
  if (!structMatch) return null
  ptr = rNamedStruct.lastIndex

  const fieldsMatch = parseStructFields(string, ptr)
  if (!fieldsMatch) return null

  return {type: {name: structMatch[1], fields: fieldsMatch.fields},
          ptr: fieldsMatch.ptr}
}

function buildField(field, structs, constInts) {
  let type = structs[field.type] || field.type

  if (field.length) {
    const length = evalConstIntExpression(constInts, field.length)
    type = {name: undefined,
            fields: Array.from({length}, (_, name) => buildField({name, type}, structs, constInts)),
            signature: `${type.signature || type}[${length}]`}
  }

  return {name: field.name,
          type,
          defaultAttachment: field.defaultAttachment}
}

function buildStruct(struct, structs, constInts) {
  const fields = [], signature = []
  for (let idx = 0; idx < struct.fields.length; idx += 1) {
    const field = struct.fields[idx]
    signature.push(field.type.signature || field.type)
    fields.push(buildField(field, structs, constInts))
  }

  return {name: struct.name,
          fields,
          signature: '{'+signature.join(',')+'}'}
}

function evalConstIntExpression(constInts, expression) {
  return new Function('expression', `${Object.keys(constInts).map(name => `
    const ${name} = ${constInts[name]}`).join('')}
    return eval(expression)
  `)(expression)
}

export default {
  parseConstInts(string) {
    const constInts = {}
    let ConstIntMatch
    while (ConstIntMatch = rConstInt.exec(string)) constInts[ConstIntMatch[1]] = ConstIntMatch[2]
    return constInts
  },

  parseStructs(string, constInts) {
    const structs = {}
    let structMatch, structPtr = 0
    while (structMatch = parseNamedStruct(string, structPtr)) {
      structPtr = structMatch.ptr
      const struct = structMatch.type
      structs[struct.name] = buildStruct(struct, structs, constInts)
    }
    return structs
  },

  parseUniforms(string, constInts) {
    const structs = this.parseStructs(string, constInts)
    const uniforms = {}
    let uniformMatch, uniformPtr = 0
    while (uniformMatch = parseUniform(string, uniformPtr)) {
      uniformPtr = uniformMatch.ptr
      if (uniformMatch.type.fields) uniformMatch.type = buildStruct(uniformMatch.type, structs, constInts)
      uniforms[uniformMatch.name] = buildField(uniformMatch, structs, constInts)
    }
    return uniforms
  }
}