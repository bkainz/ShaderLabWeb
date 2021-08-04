import escapeCSS from '../../../componentHelpers/escapeCSS'

function Editor(el, {className, props, ancestors}) {
  this.el = el
  this.className = className
  this.props = props

  this.app = ancestors.find(ancestor => ancestor.className === 'components/App')
  this.app.editor = this

  this.passes = {}
  this.tabs = null
}

Editor.prototype = {
  initialize() {
    this.formEl = this.el.querySelector(`.${escapeCSS(this.className)}-Form`)
    this.tabs = this.formEl.firstElementChild.__component__
    this.formEl.addEventListener('submit', e => {
      e.preventDefault()
      for (const meshId in this.passes)
        for (const passId in this.passes[meshId])
          this.updatePassShaders(meshId, passId)
    })
  },

  addPass(meshId, passId, state = this.props.defaultStates[meshId]) {
    this.passes[meshId] = this.passes[meshId] || {}

    if (this.passes[meshId][passId]) throw new Error(`Pass name "${passId}" already taken`)

    const pass = {id: passId, meshId, name: [meshId, passId].join('/'), shaders: {}}
    this.passes[meshId][passId] = pass

    const tabs = []
    for (const type in state.shaders) {
      pass.shaders[type] = Component.instantiate(this.props.Shader, {meshId, passId, type, state: state.shaders[type]})
      tabs.push({label: type, content: pass.shaders[type].el})
    }
    this.tabs.add(meshId, passId, tabs)

    pass.program = this.app.canvas.createProgram()

    pass.framebuffer = this.app.canvas.createFramebuffer()
    for (const attachmentId in pass.framebuffer.attachments)
      this.app.setValue('sampler2D', pass.name+' Pass '+attachmentId, pass.framebuffer.attachments[attachmentId])

    pass.mesh = this.app.canvas.createProgrammedMesh(meshId, pass.program)
    pass.framebuffer.meshes.add(pass.mesh)
    pass.mesh.eventEl.addEventListener('destroyed', e => pass.framebuffer.meshes.delete(pass.mesh))

    this.updatePassShaders(meshId, passId)
    this.app.uniforms.perPass[meshId][passId].state = state.uniforms

    return pass
  },

  updatePassShaders(meshId, passId) {
    const pass = this.passes[meshId][passId]
    pass.program.update(pass.shaders)

    this.app.log.append(`<hr data-text="${pass.name}: Compile & Link Shaders">`, '')
    for (const type in pass.program.shaders) {
      const shader = pass.program.shaders[type]
      this.app.log.append(pass.shaders[type].name, shader.compileMessage, !shader.isValid ? 'red' : '')
    }
    this.app.log.append(pass.name, pass.program.linkMessage, !pass.program.isValid ? 'red' : '')

    this.app.el.dispatchEvent(new CustomEvent('passUpdated', {detail: pass}))
  },

  renamePass(meshId, oldId, newId) {
    if (this.passes[meshId][newId]) throw new Error(`Pass name "${newId}" already taken`)

    const pass = this.passes[meshId][oldId]
    const oldName = pass.name
    delete this.passes[meshId][oldId]
    pass.id = newId
    pass.name = [meshId, newId].join('/')
    this.passes[meshId][newId] = pass

    for (const attachmentId in pass.framebuffer.attachments)
      this.app.renameValue('sampler2D', oldName+' Pass '+attachmentId, pass.name+' Pass '+attachmentId)

    this.app.el.dispatchEvent(new CustomEvent('passRenamed', {detail: {pass, oldId}}))
  },

  removePass(meshId, passId) {
    const pass = this.passes[meshId][passId]

    pass.mesh.destroy()
    pass.program.destroy()

    for (const attachmentId in pass.framebuffer.attachments)
      this.app.removeValue('sampler2D', pass.name+' Pass '+attachmentId)

    pass.framebuffer.destroy()

    this.tabs.remove(meshId, passId)

    delete this.passes[meshId][passId]
    if (this.passes[meshId].length === 0) delete this.passes[meshId]

    this.app.el.dispatchEvent(new CustomEvent('passDestroyed', {detail: pass}))
  },

  get state() {
    const state = {}
    for (const meshId in this.passes) {
      state[meshId] = {}
      for (const passId in this.passes[meshId]) {
        const pass = this.passes[meshId][passId]
        state[meshId][passId] = {shaders: {}, uniforms: this.app.uniforms.perPass[meshId][passId].state}
        for (const type in pass.shaders) state[meshId][passId].shaders[type] = pass.shaders[type].state
      }
    }
    return state
  },

  set state(state) {
    for (const meshId in this.passes)
      for (const passId in this.passes[meshId])
        this.removePass(meshId, passId)

    for (const meshId in state)
      for (const passId in state[meshId])
        this.addPass(meshId, passId, state[meshId][passId])

    this.tabs.focus(0)
  }
}

export default Editor