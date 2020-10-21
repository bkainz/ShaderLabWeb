function App(el, {className}) {
  this.el = el
  this.className = className
}

App.prototype = {
  initialize() {
    this.el.addEventListener('shadersChanged', ({detail: shaders}) => {
      this.canvas.updateShaders(shaders)
    })

    this.el.addEventListener('objectChanged', ({detail: {stage, object}}) => {
      this.canvas.updateGeometry(stage, object)
    })

    this.el.addEventListener('viewportChanged', e => {
      this.canvas.updateViewport()
    })

    this.canvas.initialize()
    this.editor.initialize()
    this.log.initialize()
    this.scene.initialize()

    this.el.dispatchEvent(new Event('viewportChanged'))

    window.addEventListener('resize', e => this.el.dispatchEvent(new Event('viewportChanged')))

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
    this.el.dispatchEvent(new Event('viewportChanged'))
  },

  resizeHorizontally(percent) {
    this.el.style.gridTemplateRows = percent+'% 0 1fr'
    this.el.dispatchEvent(new Event('viewportChanged'))
  }
}

module.exports = App