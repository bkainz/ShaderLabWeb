import CollectionValue from './instance/CollectionValue'

function Uniforms(el, {id, className}) {
  this.el = el
  this.id = id
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.uniforms = this
  this.perProgram = {}
}

Uniforms.prototype = {
  initialize() {
    this.app.el.addEventListener('userProgramUpdated', ({detail: program}) => {
      const uniforms = Object.values(program.shaders).reduce((uniforms, shader) => Object.assign(uniforms, shader.uniforms), {})
      const uniformsConfig = {name: '', fields: []}
      const oldUniforms = this.perProgram[program.id]
      for (const key in uniforms) {
        const newUniform = uniforms[key]
        const oldUniform = oldUniforms && oldUniforms.fields[newUniform.name]

        const oldType = oldUniform && oldUniform.type && (oldUniform.type.signature || oldUniform.type)
        const newType = newUniform && newUniform.type && (newUniform.type.signature || newUniform.type)
        uniformsConfig.fields.push(oldType === newType ? oldUniform : newUniform)
      }
      const newUniforms = new CollectionValue(this.app, '', program.name, uniformsConfig, program.id)
      newUniforms.stateEl.checked = !oldUniforms || oldUniforms.stateEl.checked
      oldUniforms ? this.el.replaceChild(newUniforms.el, oldUniforms.el)
                  : this.el.appendChild(newUniforms.el)
      this.perProgram[program.id] = newUniforms
    })
  },

  get state() {
    const state = {}
    for (const id in this.perProgram) state[id] = this.perProgram[id].state
    return state
  },

  set state(state) {
    for (const id in this.perProgram) this.perProgram[id].state = state[id]
  }
}

export default Uniforms