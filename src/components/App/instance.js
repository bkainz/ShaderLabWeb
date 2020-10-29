function App(el, {className}) {
  this.el = el
  this.className = className
}

App.prototype = {
  initialize() {
    this.el.addEventListener('shadersChanged', ({detail: shaders}) => {
      this.canvas.updateShaders(shaders)
    })

    this.el.addEventListener('uniformChanged', ({detail: uniform}) => {
      this.canvas.updateUniform(uniform)
    })

    this.el.addEventListener('textureUnitsChanged', ({detail: {pass, textureUnits}}) => {
      this.canvas.updateTextureUnits(pass, textureUnits)
    })

    this.el.addEventListener('geometryChanged', ({detail: {pass, geometry}}) => {
      this.canvas.updateGeometry(pass, geometry)
    })

    this.el.addEventListener('viewportChanged', ({detail: {width, height}}) => {
      this.canvas.updateViewport(width, height)
    })

    this.canvas.initialize()
    this.log.initialize()
    this.scene.initialize()
    this.uniforms.initialize()
    this.editor.initialize()

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
  }
}

module.exports = App