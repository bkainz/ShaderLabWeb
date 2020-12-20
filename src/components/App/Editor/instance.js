import escapeCSS from '../../../helpers/escapeCSS'

function Editor(el, {className, props}) {
  this.el = el
  this.className = className
  this.props = props

  this.app = el.closest('.components\\/App').__component__
  this.app.editor = this

  this.shaders = {}
  this.tabs = null
}

Editor.prototype = {
  initialize() {
    this.tabs = this.el.querySelector(`.${escapeCSS(this.className)}-Shaders`).firstElementChild.__component__
    this.el.addEventListener('submit', e => {this.updateShaders(); e.preventDefault()})
  },

  updateShaders() {
    Object.keys(this.shaders).forEach(pass => {
      const shaders = Object.values(this.shaders[pass]).map(shader => {
        return Object.assign({}, shader.state, {type: shader.type, name: shader.name})
      })
      this.app.el.dispatchEvent(new CustomEvent('shadersChanged', {detail: {pass, shaders}}))
    })
  },

  get state() {
    const state = {}
    for (const pass in this.shaders) {
      state[pass] = {}
      for (const type in this.shaders[pass])
        state[pass][type] = this.shaders[pass][type].state
    }
    return state
  },

  set state(state) {
    this.shaders = {}
    this.tabs.clear()
    for (const pass in state) {
      this.shaders[pass] = {}
      for (const type in state[pass]) {
        const name =  (pass === 'base' ? '' : pass+' ')+type[0].toUpperCase()+type.slice(1)+' Shader'
        this.shaders[pass][type] = Component.instantiate(this.props.Shader, {pass, type, name, state: state[pass][type]})
        this.tabs.add(pass+'/'+type, name, this.shaders[pass][type].el)
      }
    }
    this.tabs.focus(0)
    this.updateShaders()
  }
}

export default Editor