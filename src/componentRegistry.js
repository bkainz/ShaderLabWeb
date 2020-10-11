import url from 'url'
import path from 'path'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export default {
  classes: {},
  register(uri, props) {
    const dir = decodeURI(new url.URL(path.dirname(uri)).pathname)
    const className = path.relative(path.join(__dirname, 'components'), dir)
    if (!this.classes[className]) this.classes[className] = {dir, className, instanceCount: 0, instances: {}}
    const id = className+'-'+(this.classes[className].instanceCount += 1)
    this.classes[className].instances[id] = {className, id, props}
    return {className, id}
  }
}