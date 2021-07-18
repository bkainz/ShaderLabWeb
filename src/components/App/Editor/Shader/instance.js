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
  this.programId = props.programId
  this.type = props.type
  this.name = props.name
  this.id = props.programId+'/'+props.type

  this.sourceEl = this.el.querySelector(`.${escapeCSS(this.className)}-Source`)
  this.isLinkedEl = this.el.querySelector(`.${escapeCSS(this.className)}-isLinked`)

  this.state = props.state

  this.editor = null
  editorLoaded(_ => {
    this.editor = monaco.editor.create(this.sourceEl, {value: this.source,
                                                       language: 'c',
                                                       automaticLayout: true,
                                                       minimap: {enabled: false}})
  })
}

Shader.prototype = {
  get state() {
    return {source: this.editor ? this.editor.getValue() : this.source,
            isLinked: this.isLinkedEl.checked}
  },

  set state(state) {
    this.editor ? this.editor.setValue(state.source) : this.source = state.source
    this.isLinkedEl.checked = state.isLinked
  }
}

export default Shader