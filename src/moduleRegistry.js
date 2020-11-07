import fs from 'fs'
import url from 'url'
import path from 'path'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const importRegexp = /^\s*import\s+(\w+)\s+from\s+(['"])([^"']+)\2(;|$)\n*/myg
const exportRegexp = /export\s+default\s+/

const modules = {}

const registry = {
  register(contentPath) {
    const id = path.relative(__dirname, contentPath.endsWith('/instance.js') ? contentPath.slice(0, -12)
                                      : contentPath.endsWith('.js')          ? contentPath.slice(0, -3)
                                      :                                        contentPath)

    if (!modules[id]) {
      const dependencies = {}
      const content = fs.readFileSync(contentPath, 'utf-8')
                        .replace(importRegexp, (match, alias, _, importPath) => {
                          const modulePath = path.join(path.dirname(contentPath), importPath)
                                           + (importPath.endsWith('.js') ? '' : '.js')
                          const module = registry.register(modulePath)
                          dependencies[module.id] = alias
                          return ''
                        })
                        .replace(exportRegexp, () => `modules['${id}'] = `)

      modules[id] = {id, content, dependencies}
    }

    return modules[id]
  },
  toScript() {
    return `
      const modules = {}${Object.values(modules).map(module => `
      !function(${Object.values(module.dependencies).join(', ')}) {
        ${module.content.replace(/\n/g, '\n        ')}
      }(${Object.keys(module.dependencies).map(id => `modules['${id}']`).join(', ')})`).join('\n')}
    `.trim().replace(/\n {6}/g, '\n')
  }
}

export default registry