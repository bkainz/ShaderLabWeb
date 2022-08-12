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
      for (const id in this.passes) this.updatePassShaders(id)
    })
  },

  buildNewPassName(meshId) {
    let passName = 'Pass', i = 0
    for (const pass of Object.values(this.passes).filter(pass => pass.meshId === meshId))
      if (pass.name === passName) passName = 'Pass'+(i+=1)
    return passName
  },

  isPassNameTaken(meshId, passName) {
    for (const id in this.passes)
      if (this.passes[id].meshId === meshId && this.passes[id].name === passName)
        return true
    return false
  },

  addPass(meshId, passName, state = this.props.defaultStates[meshId]) {
    if (this.isPassNameTaken(meshId, passName)) throw new Error(`Pass name "${passName}" already taken`)

    let id = 0; for (const passId in this.passes) id = this.passes[passId].id >= id ? this.passes[passId].id+1 : id

    const pass = {id, name: passName, meshId, stateId: [meshId, passName].join('/'), shaders: {}}
    this.passes[id] = pass

    for (const type in state.shaders) pass.shaders[type] = Component.instantiate(this.props.Shader, {type, state: state.shaders[type]})
    this.tabs.add(pass)

    pass.program = this.app.canvas.createProgram()

    pass.framebuffer = this.app.canvas.createFramebuffer()
    for (const attachmentId in pass.framebuffer.attachments)
      this.app.setValue('sampler2D', pass.stateId+' Pass '+attachmentId, pass.framebuffer.attachments[attachmentId])

    pass.mesh = this.app.canvas.createProgrammedMesh(meshId, pass.program)
    pass.framebuffer.meshes.add(pass.mesh)
    pass.mesh.eventEl.addEventListener('destroyed', e => pass.framebuffer.meshes.delete(pass.mesh))

    this.updatePassShaders(id)
    this.app.uniforms.perPass[id].state = state.uniforms

    return pass
  },

  updatePassShaders(id) {
    const pass = this.passes[id]
    pass.program.update(pass.shaders)

    this.app.log.append(`<hr data-text="${pass.stateId}: Compile & Link Shaders">`, '')
    for (const type in pass.program.shaders) {
      const shader = pass.program.shaders[type]
      this.app.log.append(pass.shaders[type].name, shader.compileMessage, !shader.isValid ? 'red' : '')
    }
    this.app.log.append(pass.stateId, pass.program.linkMessage, !pass.program.isValid ? 'red' : '')

    this.app.el.dispatchEvent(new CustomEvent('passUpdated', {detail: pass}))
  },

  renamePass(id, newName) {
    const pass = this.passes[id]

    if (this.isPassNameTaken(pass.meshId, newName)) throw new Error(`Pass name "${newName}" already taken`)

    const oldName = pass.name
    const oldStateId = pass.stateId
    pass.name = newName
    pass.stateId = [pass.meshId, newName].join('/')

    for (const attachmentId in pass.framebuffer.attachments)
      this.app.renameValue('sampler2D', oldStateId+' Pass '+attachmentId, pass.stateId+' Pass '+attachmentId)

    this.app.el.dispatchEvent(new CustomEvent('passRenamed', {detail: {pass, oldName}}))
  },

  removePass(id) {
    const pass = this.passes[id]

    pass.mesh.destroy()
    pass.program.destroy()

    for (const attachmentId in pass.framebuffer.attachments)
      this.app.removeValue('sampler2D', pass.stateId+' Pass '+attachmentId)

    pass.framebuffer.destroy()

    this.tabs.remove(pass)

    delete this.passes[id]

    this.app.el.dispatchEvent(new CustomEvent('passDestroyed', {detail: pass}))
  },

  get state() {
    const state = {}
    for (const id in this.passes) {
      const pass = this.passes[id]
      state[pass.meshId] = state[pass.meshId] || {}
      state[pass.meshId][pass.name] = {shaders: {}, uniforms: this.app.uniforms.perPass[pass.id].state}
      for (const type in pass.shaders) state[pass.meshId][pass.name].shaders[type] = pass.shaders[type].state
    }
    return state
  },

  set state(state) {
    for (const id in this.passes)
      this.removePass(id)

    for (const meshId in state)
      for (const passName in state[meshId])
        this.addPass(meshId, passName, state[meshId][passName])

    this.tabs.focus(0)
  }
}

export default Editor