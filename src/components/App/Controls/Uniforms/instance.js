import CollectionValue from './instance/CollectionValue'

function Uniforms(el, {id, className}) {
  this.el = el
  this.id = id
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.uniforms = this

  this.uniforms = new CollectionValue(this, '', [])
}

Uniforms.prototype = {
  initialize() {
    this.app.el.addEventListener('shadersChanged', ({detail: shaders}) => {
      const uniforms = {}
      const rUniform = /uniform\s+(\S+)\s+(\S+)\s*(?:\/\*\s*attach to:([^*]+)\*\/)?\s*;/g
      shaders.forEach(shader => {
        let match
        while (match = rUniform.exec(shader.source)) {
          const type = match[1]
          const name = match[2]
          const defaultAttachment = match[3] && match[3].trim()
          const key = name+'-'+type
          uniforms[key] = uniforms[key] || {name, type, defaultAttachment, passes: []}
          uniforms[key].passes.push(shader.pass)
        }
      })

      this.el.innerHTML = ''
      const oldUniforms = this.uniforms
      this.uniforms = new CollectionValue(this, '', Object.values(uniforms))
      for (const name in this.uniforms.fields) this.el.appendChild(this.uniforms.fields[name].el)
      const uniformsValue = {}
      for (const name in this.uniforms.value) uniformsValue[name] = oldUniforms.value[name] || this.uniforms.value[name]
      this.uniforms.value = uniformsValue
    })
  }
}

export default Uniforms