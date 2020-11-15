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
}

App.prototype = {
  initialize() {
    this.el.addEventListener('shadersChanged', ({detail: {pass, shaders}}) => {
      this.canvas.updateShaders(pass, shaders)
    })

    this.el.addEventListener('uniformChanged', ({detail: uniform}) => {
      this.canvas.updateUniform(uniform)
    })

    this.el.addEventListener('geometryChanged', ({detail: {pass, geometry}}) => {
      this.canvas.updateGeometry(pass, geometry)
    })

    this.el.addEventListener('viewportChanged', ({detail: {width, height}}) => {
      this.canvas.updateViewport(width, height)
    })

    this.log.initialize()
    this.scene.initialize()
    this.uniforms.initialize()
    this.editor.initialize()
    this.canvas.initialize()

    this.editor.updateShaders()

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

    initalizeDraggableBorder(this.el.querySelector(`.${this.className}-VerticalBorder`), e => {
      const bb = this.el.getBoundingClientRect()
      this.resizeVertically((bb.left+e.clientX)/bb.width * 100)
    })

    initalizeDraggableBorder(this.el.querySelector(`.${this.className}-HorizontalBorder`), e => {
      const bb = this.el.getBoundingClientRect()
      this.resizeHorizontally((bb.top+e.clientY)/bb.height * 100)
    })

    const render = () => {
      this.canvas.render()
      requestAnimationFrame(render)
    }
    render()
  },

  resizeVertically(percent) {
    this.el.style.gridTemplateColumns = percent+'% 0 1fr'
    this.el.dispatchEvent(new CustomEvent('viewportChanged', {detail: this.canvas.size}))
  },

  resizeHorizontally(percent) {
    this.el.style.gridTemplateRows = percent+'% 0 1fr'
    this.el.dispatchEvent(new CustomEvent('viewportChanged', {detail: this.canvas.size}))
  },

  registerValue(name, type) {
    this.values[type] = this.values[type] || {}
    this.values[type][name] = this.values[type][name] || new Value(name, type)
  }
}

export default App