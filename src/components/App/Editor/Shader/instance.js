import escapeCSS from '../../../../componentHelpers/escapeCSS'

const editorLoadedCallbacks = []
let editorLoaded = editorLoadedCallbacks.push.bind(editorLoadedCallbacks)

window.requireAvailable(() => {
  require.config({paths: {vs: '/monaco-editor/min/vs'}})
  require(['vs/editor/editor.main'], _ => {
    editorLoaded = function(callback){ callback() }
    let callback; while (callback = editorLoadedCallbacks.shift()) callback()
  })
})

function Shader(el, {className, props}) {
  this.el = el
  this.className = className
  this.meshId = props.meshId
  this.passId = props.passId
  this.type = props.type
  this.sourceEl = this.el.querySelector(`.${escapeCSS(this.className)}-Source`)

  this.editor = null
  editorLoaded(_ => {
    this.editor = monaco.editor.create(this.sourceEl, {value: this._source,
                                                       language: 'c',
                                                       automaticLayout: true,
                                                       minimap: {enabled: false}})
  })

  this.state = props.state
}

Shader.prototype = {
  initialize() {
    this.app = this.el.closest('.components\\/App').__component__
    editorLoaded(_ => this.editor.onDidChangeModelContent(e => this.app.announceStateChange()))
  },

  get source() {
    return this.editor ? this.editor.getValue() : this._source
  },

  get name() {
    return this.type[0].toUpperCase()+this.type.slice(1)+' Shader'
  },

  get state() {
    return {source: this.source}
  },

  set state(state) {
    this.editor ? this.editor.setValue(state.source) : this._source = state.source
  }
}

export default Shader