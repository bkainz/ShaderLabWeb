function Textures(pass, length) {
  this.pass = pass
  this.units = Array.from({length})
}

Textures.prototype = {
  reset() {
    this.units = Array.from({length: this.units.length})
  },

  add(texture, type) {
    const unit = this.units.indexOf(undefined)
    if (unit < 0) {
      this.pass.scene.canvas.app.log.append('Texture Units', `No more free texture units. Max: ${this.units.length}`)
      return false
    }
    const target = type === 'sampler2D'   ? this.pass.webGL.TEXTURE_2D
                 : type === 'samplerCube' ? this.pass.webGL.TEXTURE_CUBE_MAP
                 :                          null
    if (!type) throw new Error(`invalid texture type '${type}'`)
    this.units[unit] = {unit, target, texture}
    return unit
  },

  forEach(callback) {
    for (let idx = 0; this.units[idx]; idx += 1) callback(this.units[idx])
  }
}

export default Textures