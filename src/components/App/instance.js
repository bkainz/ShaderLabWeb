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
      this.values[type][name] = new Value(name, type)
      this.el.dispatchEvent(new CustomEvent('valueTypeListChanged', {detail: this.values[type]}))
    }
    this.values[type][name].value = value
  },

  getValue(type, name) {
    return this.values[type] && this.values[type][name] && this.values[type][name].value
  },

  removeValue(type, name) {
    if (!this.values[type]) return
    delete this.values[type][name]
    this.el.dispatchEvent(new CustomEvent('valueTypeListChanged', {detail: this.values[type]}))
  },

  onChangedValue(type, name, callback) {
    this.values[type] = this.values[type] || {}
    this.values[type][name] = this.values[type][name] || new Value(name, type)
    this.values[type][name].el.addEventListener('valueChanged', ({detail: value}) => callback(value))
  },

  onChangedValueTypeList(type, callback) {
    this.el.addEventListener('valueTypeListChanged', ({detail: list}) => list === this.values[type] && callback(list))
  },

  setValueMigration(type, alias, name) {
    this.valueMigrations[type] = this.valueMigrations[type] || {}
    this.valueMigrations[type][alias] = name
  },

  get state() {
    return {editor: this.editor.state,
            camera: this.camera.state,
            model: this.model.state,
            uniforms: this.uniforms.state}
  },

  set state(state) {
    // Derive canvas state from the editor state: Each shader pair in the editor state
    // gets a framebuffer, mesh and program. Mesh, program and framebuffer are also
    // combined into a "programmed mesh" linking the otherwise independent mesh and
    // program.
    state.canvas = {framebuffers: {}, meshes: {}, programs: {}, programmedMeshes: {}}
    Object.keys(state.editor).forEach((id, idx) => {
      state.canvas.framebuffers[id] = {}
      state.canvas.meshes[id] = {mesh: idx === 0 ? 'void' : 'quad', isModel: idx === 0}
      state.canvas.programs[id] = {}
      state.canvas.programmedMeshes[id] = {mesh: id, program: id, framebuffer: id}
    })

    this.model.meshId = Object.keys(state.editor)[0]

    this.canvas.state = state.canvas
    this.editor.state = state.editor
    this.camera.state = state.camera
    this.model.state = state.model
    this.uniforms.state = state.uniforms
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