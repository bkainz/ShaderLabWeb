import state from '../../../../componentHelpers/state'
import algebra from '../../../../componentHelpers/algebra'
import loadMesh from '../../../../componentHelpers/loadMesh'
import escapeCSS from '../../../../componentHelpers/escapeCSS'
const {M, T, R, S, I, mat4ToMat3, transpose} = algebra

function Model(el, {className}) {
  this.el = el
  this.className = className
  this.app = el.closest('.components\\/App').__component__
  this.app.model = this

  this.meshNameEl = this.el.querySelector(`.${escapeCSS(this.className)}-MeshName`)
  this.meshNameEl.addEventListener('change', e => {
    this.mesh = this.meshNameEl.value === 'file' ? this.meshFile
                                                 : this.meshNameEl.value
  })

  this.meshFile = {name: '', content: ''}
  this.meshFileLoaded = false
  this.meshFileEl = this.el.querySelector(`.${escapeCSS(this.className)}-MeshFile`)
  this.meshFileEl.addEventListener('change', e => {
    const reader = new FileReader()
    reader.readAsText(this.meshFileEl.files[0])
    reader.onloadend = () => {
      this.meshFile = {name: this.meshFileEl.files[0].name, content: reader.result}
      this.meshFileLoaded = false
      if (this.meshNameEl.value === 'file') this.mesh = this.meshFile
    }
  })

  this.vertexCountEl = this.el.querySelector(`.${escapeCSS(this.className)}-VertexCount`)
  this.vertexTypeEl = this.el.querySelector(`.${escapeCSS(this.className)}-VertexType`)
  this.normalTypeEl = this.el.querySelector(`.${escapeCSS(this.className)}-NormalType`)
  this.tCoordTypeEl = this.el.querySelector(`.${escapeCSS(this.className)}-TCoordType`)
}

function updateModelMatrix() {
  const position = this.position || [0, 0, 0]
  const rotationAxis = this.rotationAxis || [0, 0, 1]
  const rotationAngle = this.rotationAngle || 0
  const scale = this.scale || [1, 1, 1]
  const transform = M(R(rotationAngle, rotationAxis), S(scale))
  const modelMatrix = M(T(position), transform)
  this.app.setValue('mat3', 'Model Transform', mat4ToMat3(transform))
  this.app.setValue('mat4', 'Model Matrix', modelMatrix)
  this.app.setValue('mat4', 'Inverse Model Matrix', I(modelMatrix))
  this.app.setValue('mat3', 'Normal Matrix', mat4ToMat3(transpose(I(transform))))
}

const STATE = {
  mesh: {type: 'custom', name: 'Model Mesh',
    async onChange(value) {
      const name = typeof value === 'object' && value ? value.name : value || 'teapot'
      const content = typeof value === 'object' && value ? value.content : undefined

      this.vertexCountEl.innerText = 'loading…'
      this.vertexTypeEl.innerText = '…'
      this.normalTypeEl.innerText = '…'
      this.tCoordTypeEl.innerText = '…'

      let mesh
      if (content !== undefined) {
        this.meshNameEl.value = 'file'
        this.meshFileEl.style.display = 'block'

        const dataTransfer = new DataTransfer()
        content && dataTransfer.items.add(new File([content], name))
        this.meshFileEl.files = dataTransfer.files

        if (!this.meshFileLoaded || value !== this.meshFile)
          this.meshFileLoaded = await new Promise(resolve => {
                                  requestAnimationFrame(() => { // Give loading feedback time to display
                                    requestAnimationFrame(async() => {
                                      resolve(await loadMesh(name, content))
                                    })
                                  })
                                })
        mesh = this.meshFileLoaded
      }
      else {
        this.meshNameEl.value = name
        this.meshFileEl.style.display = ''
        mesh = await loadMesh(name)
      }

      this.vertexCountEl.innerText = mesh.elements.length
      'vertex normal tCoord'.split(' ').forEach(attr => {
        const count = mesh.attributes[attr] ? mesh.attributes[attr].count : 0
        this[attr+'TypeEl'].innerText = count < 1 ? 'no'
                                      : count < 2 ? 'float'
                                      :             'vec'+count
      })
      this.app.canvas.updateMesh('Model', mesh)
    }},
  position: {type: 'vec3', name: 'Model Position', onChange: updateModelMatrix},
  rotationAxis: {type: 'vec3', name: 'Model Rotation Axis', onChange: updateModelMatrix},
  rotationAngle: {type: 'float', name: 'Model Rotation Angle', onChange: updateModelMatrix},
  scale: {type: 'vec3',  name: 'Model Scale', onChange: updateModelMatrix},
  depthTest: {type: 'config', name: 'Depth Test'},
  faceCulling: {type: 'config', name: 'Face Culling'},
  frontFace: {type: 'config', name: 'Front Face'},
  blendEnable: {type: 'config', name: 'Blend Enable'},
  blendOperation: {type: 'config', name: 'Blend Operation'},
  srcColorBlendFactor: {type: 'config', name: 'Src Color Blend Factor'},
  dstColorBlendFactor: {type: 'config', name: 'Dst Color Blend Factor'},
  srcAlphaBlendFactor: {type: 'config', name: 'Src Alpha Blend Factor'},
  dstAlphaBlendFactor: {type: 'config', name: 'Dst Alpha Blend Factor'},
  blendMode: {type: 'config', name: 'Blend Mode'},
  blendMode: {type: 'config', name: 'Blend Mode'},
  textureFiltering: {type: 'config', name: 'Texture Filtering'},
  maxAnisotropy: {type: 'config', name: 'Max. Anisotropy'},
  showWorldCoordinates: {type: 'config', name: 'Show World Coordinates'},
  showWireframe: {type: 'config', name: 'Show Wireframe'}
}

Model.prototype = {
  initialize() {
    state.initializeForInstance(this, STATE)
    this.meshFileEl.files[0] && this.meshFileEl.dispatchEvent(new Event('change'))
  }
}

state.initializeForPrototype(Model.prototype, STATE)

export default Model