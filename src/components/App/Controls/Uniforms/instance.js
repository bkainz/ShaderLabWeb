import CollectionValue from './instance/CollectionValue'

function Uniforms(el, {id, className}) {
  this.el = el
  this.id = id
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.uniforms = this
  this.perPass = {}
}

Uniforms.prototype = {
  initialize() {
    this.app.el.addEventListener('passLinked', ({detail: pass}) => {
      const uniforms = pass.uniforms, uniformsConfig = {name: '', fields: []}
      const oldUniforms = this.perPass[pass.key]
      for (const key in uniforms) {
        const newUniform = uniforms[key]
        const oldUniform = oldUniforms && oldUniforms.fields[newUniform.name]

        const oldType = oldUniform && oldUniform.type && (oldUniform.type.signature || oldUniform.type)
        const newType = newUniform && newUniform.type && (newUniform.type.signature || newUniform.type)
        uniformsConfig.fields.push(oldType === newType ? oldUniform : newUniform)
      }
      const newUniforms = new CollectionValue(this.app, '', pass.name, uniformsConfig, undefined, pass)
      newUniforms.stateEl.checked = !oldUniforms || oldUniforms.stateEl.checked
      oldUniforms ? this.el.replaceChild(newUniforms.el, oldUniforms.el)
                  : this.el.appendChild(newUniforms.el)
      this.perPass[pass.key] = newUniforms
    })
  },

  get state() {
    const state = {}
    for (const pass in this.perPass) state[pass] = this.perPass[pass].state
    return state
  },

  set state(state) {
    for (const pass in this.perPass) this.perPass[pass].state = state[pass]
  }
}

export default Uniforms