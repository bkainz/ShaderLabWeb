import fs from 'fs'
import url from 'url'
import path from 'path'

const srcDir = path.dirname(path.dirname(path.dirname(url.fileURLToPath(import.meta.url))))

const importRegexp = /^\s*import\s+(\w+)\s+from\s+(['"])([^"']+)\2(;|$)\n*/myg
const exportRegexp = /export\s+default\s+/

function ModuleRegistry() {
  this.modules = {}
}

ModuleRegistry.prototype = {
  register(contentPath) {
    const id = path.relative(srcDir, contentPath.endsWith('/instance.js') ? contentPath.slice(0, -12)
                                   : contentPath.endsWith('.js')          ? contentPath.slice(0, -3)
                                   :                                        contentPath)

    if (!this.modules[id]) {
      const dependencies = {}
      const content = fs.readFileSync(contentPath, 'utf-8')
                        .replace(importRegexp, (match, alias, _, importPath) => {
                          const extname = path.extname(importPath)
                          const modulePath = path.join(path.dirname(contentPath), importPath) + (extname ? '' : '.js')
                          const module = this.register(modulePath)
                          dependencies[module.id] = alias
                          return ''
                        })
                        .replace(exportRegexp, () => `modules['${id}'] = `)

      this.modules[id] = {id, content, dependencies}
    }

    return this.modules[id]
  },
  toScript() {
    return `
      const modules = {}${Object.values(this.modules).map(module => path.extname(module.id) === '.json' ? `
      modules['${module.id}'] = ${module.content.replace(/\n/g, '\n      ')}` : `
      !function(${Object.values(module.dependencies).join(', ')}) {
        ${module.content.replace(/\n/g, '\n        ')}
      }(${Object.keys(module.dependencies).map(id => `modules['${id}']`).join(', ')})`
      ).join('\n')}
    `.trim().replace(/\n {6}/g, '\n')
  }
}

export default ModuleRegistry