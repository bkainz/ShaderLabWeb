import algebra from './algebra'

const {I, minus, normalize, cross} = algebra

export default {
  perspectiveProjection(fov, aspect, near, far) {
    const rad = fov * Math.PI/180
    const tan = Math.tan(Math.PI/2 - rad/2)
    const depth = far - near
    return [tan/aspect,   0,                 0,  0,
                     0, tan,                 0,  0,
                     0,   0, -(near+far)/depth, -1,
                     0,   0, -2*near*far/depth,  0]
  },

  orthographicProjection(fov, aspect, near, far) {
    const width = fov*aspect
    const height = fov
    const depth = far - near
    return [2/width,        0,         0, 0,
                  0, 2/height,         0, 0,
                  0,         0, -2/depth, 0,
                  0,         0,        0, 1]
  },

  camera(from, to, up) {
    const ez = normalize(minus(from, to))
    const ex = normalize(cross(up, ez))
    const ey = cross(ez, ex)

    return [...ex, 0,
            ...ey, 0,
            ...ez, 0,
            ...from, 1]
  },

  viewMatrix(from, to, up) {
    return I(this.camera(from, to, up))
  }
}