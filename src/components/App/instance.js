import defaultState from '../../defaultState.json'

function Value(name, type) {
  this.name = name
  this.type = type
  this._value = undefined
  this.el = document.createElement('div')
}
Value.prototype = {
  get value() {
    return this._value
  },
  set value(value) {
    this._value = value
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: value}))
  }
}

function App(el, {className}) {
  this.el = el
  this.className = className
  this.values = {}
  this.contentEl = this.el.querySelector(`.${this.className}-Content`)
}

App.prototype = {
  initialize() {
    this.el.addEventListener('shadersChanged', ({detail: {pass, shaders}}) => {
      this.canvas.updateProgram(pass, shaders)
    })

    this.el.addEventListener('uniformChanged', ({detail: {pass, uniform}}) => {
      this.canvas.updateUniform(pass, uniform)
    })

    this.el.addEventListener('meshChanged', ({detail: {pass, mesh}}) => {
      this.canvas.updateMesh(pass, mesh)
    })

    this.el.addEventListener('viewportChanged', ({detail: {width, height}}) => {
      this.canvas.updateViewport(width, height)
    })

    this.header.initialize()
    this.log.initialize()
    this.camera.initialize()
    this.model.initialize()
    this.uniforms.initialize()
    this.editor.initialize()
    this.canvas.initialize()

    this.state = defaultState

    this.el.dispatchEvent(new CustomEvent('viewportChanged', {detail: this.canvas.size}))

    window.addEventListener('resize', e => this.el.dispatchEvent(new CustomEvent('viewportChanged', {detail: this.canvas.size})))

    function initalizeDraggableBorder(el, callback) {
      el.addEventListener('mousedown', e => {
        el.classList.add('active')
        el.addEventListener('mousemove', callback)
        el.addEventListener('mouseup', e => {
          el.classList.remove('active')
          el.removeEventListener('mousemove', callback)
        })
      })
    }

    initalizeDraggableBorder(this.contentEl.querySelector(`.${this.className}-VerticalBorder`), e => {
      const bb = this.contentEl.getBoundingClientRect()
      this.resizeVertically((e.clientX-bb.left)/bb.width * 100)
    })

    initalizeDraggableBorder(this.contentEl.querySelector(`.${this.className}-HorizontalBorder`), e => {
      const bb = this.contentEl.getBoundingClientRect()
      this.resizeHorizontally((e.clientY-bb.top)/bb.height * 100)
    })

    const render = time => {
      this.setValue('int', 'Time in Milliseconds', Math.floor(time))
      this.canvas.render()
      requestAnimationFrame(render)
    }
    render()
  },

  resizeVertically(percent) {
    this.contentEl.style.gridTemplateColumns = percent+'% var(--border-width) 1fr'
    this.el.dispatchEvent(new CustomEvent('viewportChanged', {detail: this.canvas.size}))
  },

  resizeHorizontally(percent) {
    this.contentEl.style.gridTemplateRows = percent+'% var(--border-width) 1fr'
    this.el.dispatchEvent(new CustomEvent('viewportChanged', {detail: this.canvas.size}))
  },

  setValue(type, name, value) {
    this.values[type] = this.values[type] || {}
    this.values[type][name] = this.values[type][name] || new Value(name, type)
    this.values[type][name].value = value
  },

  getValue(type, name) {
    this.values[type] = this.values[type] || {}
    this.values[type][name] = this.values[type][name] || new Value(name, type)
    return this.values[type][name].value
  },

  onChangedValue(type, name, callback) {
    this.values[type] = this.values[type] || {}
    this.values[type][name] = this.values[type][name] || new Value(name, type)
    this.values[type][name].el.addEventListener('valueChanged', ({detail: value}) => callback(value))
  },

  get state() {
    return {editor: this.editor.state,
            camera: this.camera.state,
            model: this.model.state,
            uniforms: this.uniforms.state}
  },

  set state(state) {
    this.editor.state = state.editor
    this.camera.state = state.camera
    this.model.state = state.model
    this.uniforms.state = state.uniforms
  }
}

export default App