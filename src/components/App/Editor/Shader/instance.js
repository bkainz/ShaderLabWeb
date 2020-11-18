import escapeCSS from '../../../../helpers/escapeCSS'

const editorLoadedCallbacks = []
let editorLoaded = editorLoadedCallbacks.push.bind(editorLoadedCallbacks)

const monacoEditor = document.createElement('script')
monacoEditor.src = 'monaco-editor/min/vs/loader.js'
monacoEditor.addEventListener('load', e => {
  require.config({paths: { 'vs': 'monaco-editor/min/vs' }})
  require(['vs/editor/editor.main'], _ => {
    editorLoaded = function(callback){ callback() }
    let callback; while (callback = editorLoadedCallbacks.shift()) callback()
  })
})
document.head.appendChild(monacoEditor)

function Shader(el, {className, props}) {
  this.el = el
  this.className = className
  this.pass = props.pass
  this.type = props.type
  this.name = props.name
  this.source = ''
  this.id = [props.pass, props.type].filter(Boolean).join('/')
  this.app = el.closest('.App').__component__
  this.app.editor.shaders[this.pass] = this.app.editor.shaders[this.pass] || {}
  this.app.editor.shaders[this.pass][this.type] = this

  this.editor = null
  editorLoaded(_ => {
    const editorEl = this.el.querySelector(`.${escapeCSS(this.className)}-Source`)
    this.editor = monaco.editor.create(editorEl, {value: this.source,
                                                  language: 'c',
                                                  automaticLayout: true,
                                                  minimap: {enabled: false}})
  })
}

Shader.prototype = {
  get state() {
    return {source: this.editor ? this.editor.getValue() : this.source,
            isLinked: this.el.querySelector(`.${escapeCSS(this.className)}-isLinked`).checked}
  },

  set state(state) {
    this.editor ? this.editor.setValue(state.source) : this.source = state.source
    this.el.querySelector(`.${escapeCSS(this.className)}-isLinked`).checked = state.isLinked
  }
}

export default Shader