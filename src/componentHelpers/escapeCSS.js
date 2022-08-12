export default function(value) {
  value = value.replace(/[^0-9a-zA-Z_-\u0080-\uFFFF]/g, '\\$&')
  value = /\d/.test(value[0]) ? '\\3'+value[0]+' '+value.slice(1) : value
  return value
}