const rType = /(\w+)\s+/gy
const rName = /(\w+)\s*(?:\/\*\s*attach to:([^*]+)\*\/)?\s*;\s*/gy
const rUniform = /uniform\s+/g

function parseType(string, ptr) {
  rType.lastIndex = ptr
  const typeMatch = rType.exec(string)
  return typeMatch && {type: typeMatch[1], ptr: rType.lastIndex}
}

function parseName(string, ptr) {
  rName.lastIndex = ptr
  const match = rName.exec(string)
  return match && {name: match[1], defaultAttachment: match[2] && match[2].trim(), ptr: rName.lastIndex}
}

function parseField(string, ptr) {
  const typeMatch = parseType(string, ptr)
  if (!typeMatch) return null

  const nameMatch = parseName(string, typeMatch.ptr)
  if (!nameMatch) return null

  return {name: nameMatch.name,
          type: typeMatch.type,
          defaultAttachment: nameMatch.defaultAttachment,
          ptr: nameMatch.ptr}
}

function parseUniform(string, ptr) {
  rUniform.lastIndex = ptr
  const uniformMatch = rUniform.exec(string)
  if (!uniformMatch) return null
  ptr = rUniform.lastIndex

  const fieldMatch = parseField(string, ptr)
  if (!fieldMatch) return null

  return fieldMatch
}

export default {
  parseUniforms(string) {
    const uniforms = {}
    let uniformMatch, uniformPtr = 0
    while (uniformMatch = parseUniform(string, uniformPtr)) {
      uniformPtr = uniformMatch.ptr
      const key = uniformMatch.name+'-'+uniformMatch.type
      uniforms[key] = {name: uniformMatch.name,
                       type: uniformMatch.type,
                       defaultAttachment: uniformMatch.defaultAttachment}
    }
    return uniforms
  }
}