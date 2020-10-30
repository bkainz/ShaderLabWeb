module.exports = {
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

  R(angle, x, y, z) {
    const len = Math.sqrt(x*x + y*y + z*z); x /= len; y /= len; z /= len
    const sin = Math.sin(angle/180*Math.PI), cos = Math.cos(angle/180*Math.PI)
    return [x*x*(1-cos) +   cos, y*x*(1-cos) + z*sin, z*x*(1-cos) - y*sin, 0,
            x*y*(1-cos) - z*sin, y*y*(1-cos) +   cos, z*y*(1-cos) + x*sin, 0,
            x*z*(1-cos) + y*sin, y*z*(1-cos) - x*sin, z*z*(1-cos) +   cos, 0,
                              0,                   0,                   0, 1]
  },

  T(x, y, z) {
    return [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1]
  }
}