import escapeCSS from '../../../../componentHelpers/escapeCSS'
import CollectionValue from './instance/CollectionValue'

function Uniforms(el, {id, className}) {
  this.el = el
  this.id = id
  this.className = className
  this.app = el.closest('.components\\/App').__component__
  this.app.uniforms = this
  this.perPass = {}
}

Uniforms.prototype = {
  initialize() {
    this.shaderUniformsEl = this.el.querySelector(`.${escapeCSS(this.className)}-ShaderUniforms`)
    this.outputUniformsEl = this.el.querySelector(`.${escapeCSS(this.className)}-OutputUniforms`)

    this.app.el.addEventListener('passUpdated', ({detail: pass}) => {
      const uniforms = Object.values(pass.program.shaders).reduce((uniforms, shader) => Object.assign(uniforms, shader.uniforms), {})
      const uniformsConfig = {name: '', fields: []}
      const oldUniforms = this.perPass[pass.id]
      for (const key in uniforms) {
        const newUniform = uniforms[key]
        const oldUniform = oldUniforms && oldUniforms.fields[newUniform.name]

        const oldType = oldUniform && oldUniform.type && (oldUniform.type.signature || oldUniform.type)
        const newType = newUniform && newUniform.type && (newUniform.type.signature || newUniform.type)
        uniformsConfig.fields.push(oldType === newType ? oldUniform : newUniform)
      }
      const newUniforms = new CollectionValue(this.app, '', pass.stateId, uniformsConfig, pass.mesh)
      newUniforms.stateEl.checked = !oldUniforms || oldUniforms.stateEl.checked
      this.perPass[pass.id] = newUniforms

      let uniformGroupEl = this.shaderUniformsEl.querySelector(`.${escapeCSS(this.className)}-UniformGroup.${escapeCSS(pass.meshId)}`)
      if (!uniformGroupEl) {
        uniformGroupEl = document.createElement('div')
        uniformGroupEl.className = this.className+'-UniformGroup '+pass.meshId
        this.shaderUniformsEl.appendChild(uniformGroupEl)
      }
      oldUniforms ? uniformGroupEl.replaceChild(newUniforms.el, oldUniforms.el)
                  : uniformGroupEl.appendChild(newUniforms.el)
    })

    this.app.el.addEventListener('passRenamed', ({detail: {pass}}) => {
      this.perPass[pass.id].name = pass.stateId
    })

    this.app.el.addEventListener('passDestroyed', ({detail: pass}) => {
      this.perPass[pass.id].destroy()
      delete this.perPass[pass.id]
    })
  },

  addOutputUniforms(programmedMesh, uniforms) {
    const uniformsConfig = {name: '', fields: Object.values(uniforms)}
    const collection = new CollectionValue(this.app, '', 'Output', uniformsConfig, programmedMesh)
    collection.stateEl.checked = true
    this.outputUniformsEl.appendChild(collection.el)
    return collection
  }
}

export default Uniforms