import NumericType from './type/NumericType'
import SamplerType from './type/SamplerType'

function Uniforms(el, {id, className}) {
  this.el = el
  this.id = id
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.uniforms = this

  this.state = {}
}

Uniforms.prototype = {
  initialize() {
    this.app.el.addEventListener('shadersChanged', ({detail: shaders}) => {
      const oldState = this.state
      this.state = {}

      const rUniform = /uniform\s+(\S+)\s+(\S+)\s*(?:\/\*\s*attach to:([^*]+)\*\/)?\s*;/g
      shaders.forEach(shader => {
        let match
        while (match = rUniform.exec(shader.source)) {
          const name = match[2]
          const type = match[1]
          const attachment = match[3] && match[3].trim()
          const key = name+'-'+type
          const constructor = NumericType.DEFAULT_VALUES[type] ? NumericType
                            : SamplerType.DEFAULT_VALUES[type] ? SamplerType
                            :                                    undefined
          this.state[key] = oldState[key] || new constructor(this, name, type, attachment)
          this.state[key].passes[shader.pass] = true
        }
      })

      this.el.innerHTML = ''
      Object.values(this.state).forEach(uniform => {
        this.el.appendChild(uniform.el)
        uniform.value = uniform.value
      })
    })
  }
}

export default Uniforms