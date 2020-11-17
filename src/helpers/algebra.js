const algebra = {
  plus(v, w) {
    const r = []
    for (let i = 0; i < v.length; i+=1) r[i] = v[i]+w[i]
    return r
  },
  minus(v, w) {
    const r = []
    for (let i = 0; i < v.length; i+=1) r[i] = v[i]-w[i]
    return r
  },
  times(v, f) {
    const r = []
    for (let i = 0; i < v.length; i+=1) r[i] = v[i]*f
    return r
  },
  over(v, f) {
    const r = []
    for (let i = 0; i < v.length; i+=1) r[i] = v[i]/f
    return r
  },

  dot(v, w) {
    let dot = 0
    for (let i = 0; i < v.length; i+=1) dot += v[i]*w[i]
    return dot
  },
  cross(v, w) {
    return [v[1]*w[2] - v[2]*w[1],
            v[2]*w[0] - v[0]*w[2],
            v[0]*w[1] - v[1]*w[0]]
  },

  length(v) {
    return Math.sqrt(algebra.dot(v, v))
  },
  normalize(v) {
    return algebra.over(v, algebra.length(v))
  },

  Mv(m, v) {
    const mv = []
    for (let i = 0; i < v.length; i+=1) mv.push(algebra.dot(v, [m[i], m[i+4], m[i+8] , m[i+12]]))
    return mv
  },

  M(a, b) {
    const c00 = a[0]*b[0]  + a[4]*b[1]  + a[8] *b[2]  + a[12]*b[3] ,
          c01 = a[1]*b[0]  + a[5]*b[1]  + a[9] *b[2]  + a[13]*b[3] ,
          c02 = a[2]*b[0]  + a[6]*b[1]  + a[10]*b[2]  + a[14]*b[3] ,
          c03 = a[3]*b[0]  + a[7]*b[1]  + a[11]*b[2]  + a[15]*b[3] ,
          c04 = a[0]*b[4]  + a[4]*b[5]  + a[8] *b[6]  + a[12]*b[7] ,
          c05 = a[1]*b[4]  + a[5]*b[5]  + a[9] *b[6]  + a[13]*b[7] ,
          c06 = a[2]*b[4]  + a[6]*b[5]  + a[10]*b[6]  + a[14]*b[7] ,
          c07 = a[3]*b[4]  + a[7]*b[5]  + a[11]*b[6]  + a[15]*b[7] ,
          c08 = a[0]*b[8]  + a[4]*b[9]  + a[8] *b[10] + a[12]*b[11],
          c09 = a[1]*b[8]  + a[5]*b[9]  + a[9] *b[10] + a[13]*b[11],
          c10 = a[2]*b[8]  + a[6]*b[9]  + a[10]*b[10] + a[14]*b[11],
          c11 = a[3]*b[8]  + a[7]*b[9]  + a[11]*b[10] + a[15]*b[11],
          c12 = a[0]*b[12] + a[4]*b[13] + a[8] *b[14] + a[12]*b[15],
          c13 = a[1]*b[12] + a[5]*b[13] + a[9] *b[14] + a[13]*b[15],
          c14 = a[2]*b[12] + a[6]*b[13] + a[10]*b[14] + a[14]*b[15],
          c15 = a[3]*b[12] + a[7]*b[13] + a[11]*b[14] + a[15]*b[15]
    return [c00, c01, c02, c03,
            c04, c05, c06, c07,
            c08, c09, c10, c11,
            c12, c13, c14, c15]
  },

  I(m) {
    const m00 = m[0],  m01 = m[1],  m02 = m[2],  m03 = m[3]
    const m10 = m[4],  m11 = m[5],  m12 = m[6],  m13 = m[7]
    const m20 = m[8],  m21 = m[9],  m22 = m[10], m23 = m[11]
    const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15]

    const d00 = m00 * m11 - m01 * m10
    const d01 = m00 * m12 - m02 * m10
    const d02 = m00 * m13 - m03 * m10
    const d03 = m01 * m12 - m02 * m11
    const d04 = m01 * m13 - m03 * m11
    const d05 = m02 * m13 - m03 * m12
    const d06 = m20 * m31 - m21 * m30
    const d07 = m20 * m32 - m22 * m30
    const d08 = m20 * m33 - m23 * m30
    const d09 = m21 * m32 - m22 * m31
    const d10 = m21 * m33 - m23 * m31
    const d11 = m22 * m33 - m23 * m32

    const det = d00 * d11 - d01 * d10 + d02 * d09 + d03 * d08 - d04 * d07 + d05 * d06
    if (!det) return null

    const i00 = (m11 * d11 - m12 * d10 + m13 * d09) / det
    const i01 = (m02 * d10 - m01 * d11 - m03 * d09) / det
    const i02 = (m31 * d05 - m32 * d04 + m33 * d03) / det
    const i03 = (m22 * d04 - m21 * d05 - m23 * d03) / det
    const i04 = (m12 * d08 - m10 * d11 - m13 * d07) / det
    const i05 = (m00 * d11 - m02 * d08 + m03 * d07) / det
    const i06 = (m32 * d02 - m30 * d05 - m33 * d01) / det
    const i07 = (m20 * d05 - m22 * d02 + m23 * d01) / det
    const i08 = (m10 * d10 - m11 * d08 + m13 * d06) / det
    const i09 = (m01 * d08 - m00 * d10 - m03 * d06) / det
    const i10 = (m30 * d04 - m31 * d02 + m33 * d00) / det
    const i11 = (m21 * d02 - m20 * d04 - m23 * d00) / det
    const i12 = (m11 * d07 - m10 * d09 - m12 * d06) / det
    const i13 = (m00 * d09 - m01 * d07 + m02 * d06) / det
    const i14 = (m31 * d01 - m30 * d03 - m32 * d00) / det
    const i15 = (m20 * d03 - m21 * d01 + m22 * d00) / det

    return [i00, i01, i02, i03,
            i04, i05, i06, i07,
            i08, i09, i10, i11,
            i12, i13, i14, i15]
  },

  R(angle, axis=[0,0,1]) {
    const [x, y, z] = algebra.normalize(axis)
    const sin = Math.sin(angle/180*Math.PI), cos = Math.cos(angle/180*Math.PI)
    return [x*x*(1-cos) +   cos, y*x*(1-cos) + z*sin, z*x*(1-cos) - y*sin, 0,
            x*y*(1-cos) - z*sin, y*y*(1-cos) +   cos, z*y*(1-cos) + x*sin, 0,
            x*z*(1-cos) + y*sin, y*z*(1-cos) - x*sin, z*z*(1-cos) +   cos, 0,
                              0,                   0,                   0, 1]
  },

  T([x=0, y=0, z=0]) {
    return [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1]
  },

  S([x=1, y=1, z=1]) {
    return [x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1]
  },

  mat4ToMat3(m) {
    return [m[0], m[1], m[2],
            m[4], m[5], m[6],
            m[8], m[9], m[10]]
  }
}

export default algebra