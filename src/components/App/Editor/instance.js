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
    this.el.addEventListener('submit', e => {this.updatePrograms(); e.preventDefault()})
  },

  updatePrograms() {
    for (const programId in this.shaders) {
      const shaders = {}
      for (const type in this.shaders[programId]) {
        const shader = this.shaders[programId][type]
        shaders[type] = Object.assign(shader.state, {type: shader.type, name: shader.name})
      }
      this.app.el.dispatchEvent(new CustomEvent('programChanged', {detail: {programId, shaders}}))
    }
  },

  get state() {
    const state = {}
    for (const programId in this.shaders) {
      state[programId] = {}
      for (const type in this.shaders[programId])
        state[programId][type] = this.shaders[programId][type].state
    }
    return state
  },

  set state(state) {
    this.shaders = {}
    this.tabs.clear()
    for (const programId in state) {
      this.shaders[programId] = {}
      for (const type in state[programId]) {
        const name =  (programId === 'base' ? '' : programId+' ')+type[0].toUpperCase()+type.slice(1)+' Shader'
        this.shaders[programId][type] = Component.instantiate(this.props.Shader, {programId, type, name, state: state[programId][type]})
        this.tabs.add(programId+'/'+type, name, this.shaders[programId][type].el)
      }
    }
    this.tabs.focus(0)
    this.updatePrograms()
  }
}

export default Editor