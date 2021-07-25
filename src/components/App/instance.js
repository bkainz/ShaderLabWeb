import Value from './instance/Value'
import escapeCSS from '../../componentHelpers/escapeCSS'

function App(el, {className, props}) {
  this.el = el
  this.className = className
  this.props = props
  this.values = {}
  this.valueMigrations = {}
}

App.prototype = {
  initialize() {
    this.stateEl = this.el.querySelector(`.${escapeCSS(this.className)}-State`)
    this.state = JSON.parse(this.stateEl.value)
    this.stateChangeThrottle && clearTimeout(this.stateChangeThrottle)

    // Watch canvas panel size and update the canvas' viewport
    const verticalBorderEl =  this.el.querySelector(`.${escapeCSS(this.className)}-VerticalBorder`)
    const horizontalBorderEl =  this.el.querySelector(`.${escapeCSS(this.className)}-HorizontalBorder`)

    initializeDraggableBorder(verticalBorderEl, e => {
      const bb =  this.el.getBoundingClientRect()
      const percent = (e.clientX-bb.left)/bb.width * 100
      this.el.style.gridTemplateColumns = percent+'% var(--border-width) 1fr'
      this.canvas.updateViewport()
    })

    initializeDraggableBorder(horizontalBorderEl, e => {
      const bb =  this.el.getBoundingClientRect()
      const percent = (e.clientY-bb.top)/bb.height * 100
      this.el.style.gridTemplateRows = percent+'% var(--border-width) 1fr'
      this.canvas.updateViewport()
    })

    window.addEventListener('resize', e => this.canvas.updateViewport())

    // Enter render loop
    const render = time => {
      this.setValue('int', 'Time in Milliseconds', Math.floor(time))
      this.canvas.render()
      requestAnimationFrame(render)
    }
    render()
  },

  setValue(type, name, value) {
    this.values[type] = this.values[type] || {}
    if (!this.values[type][name]) {
      this.values[type][name] = new Value(type, name)
      this.el.dispatchEvent(new CustomEvent('valueTypeListExpanded', {detail: this.values[type]}))
    }
    this.values[type][name].value = value
  },

  getValue(type, name) {
    return this.values[type] && this.values[type][name] && this.values[type][name].value
  },

  renameValue(type, oldName, newName) {
    this.values[type][newName] = this.values[type][oldName]
    delete this.values[type][oldName]
    this.values[type][newName].name = newName
  },

  removeValue(type, name) {
    if (!this.values[type]) return
    this.values[type][name].el.dispatchEvent(new Event('removed'))
    delete this.values[type][name]
  },

  onChangedValue(type, name, callback) {
    this.values[type] = this.values[type] || {}
    this.values[type][name] = this.values[type][name] || new Value(type, name)
    this.values[type][name].el.addEventListener('valueChanged', ({detail: value}) => callback(value))
  },

  onExpandedValueTypeList(type, callback) {
    this.el.addEventListener('valueTypeListExpanded', ({detail: list}) => list === this.values[type] && callback(list))
  },

  setValueMigration(type, alias, name) {
    this.valueMigrations[type] = this.valueMigrations[type] || {}
    this.valueMigrations[type][alias] = name
  },

  get state() {
    return {camera: this.camera.state,
            model: this.model.state,
            passes: this.editor.state,
            output: this.canvas.state}
  },

  set state(state) {
    if ('editor' in state && Object.keys(state.editor).length === 2 && 'base' in state.editor && 'R2T' in state.editor) {
      const migrateOldUniformState = function(uniform) {
        if (uniform.attachment) {
          uniform.attachment = uniform.attachment === 'Base Pass color' ? 'Model/base Pass color'
                             : uniform.attachment === 'Base Pass depth' ? 'Model/base Pass depth'
                             : uniform.attachment === 'R2T Pass color' ? 'Quad/R2T Pass color'
                             : uniform.attachment === 'R2T Pass depth' ? 'Quad/R2T Pass depth'
                             : uniform.attachment
        }
        else {
          for (const key in uniform)
            migrateOldUniformState(uniform[key])
        }
      }

      for (const key in state.uniforms)
        migrateOldUniformState(state.uniforms[key])

      state.passes = {Model: {base: {shaders: state.editor.base, uniforms: state.uniforms.base}},
                      Quad: {R2T: {shaders: state.editor.R2T, uniforms: state.uniforms.R2T}}}
      state.output = {image: 'Quad/R2T Pass color'}
    }

    for (const meshId in this.canvas.meshes) this.canvas.destroyMesh(meshId)
    for (const meshId in state.passes) this.canvas.createMesh(meshId, meshId === 'Quad' ? 'quad' : 'void')

    this.camera.state = state.camera
    this.model.state = state.model
    this.editor.state = state.passes
    this.canvas.state = state.output
  },

  announceStateChange() {
    this.stateChangeThrottle && clearTimeout(this.stateChangeThrottle)
    this.stateChangeThrottle = setTimeout(() => {
      this.stateChangeThrottle = undefined
      this.stateEl.value = JSON.stringify(this.state)
      this.el.dispatchEvent(new Event('stateChanged'))
    }, 500)
  }
}

function initializeDraggableBorder(borderEl, callback) {
  borderEl.addEventListener('mousedown', e => {
    borderEl.classList.add('active')
    borderEl.addEventListener('mousemove', callback)
    borderEl.addEventListener('mouseup', e => {
      borderEl.classList.remove('active')
      borderEl.removeEventListener('mousemove', callback)
    })
  })
}

export default App