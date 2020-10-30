import fs from 'fs'
import url from 'url'
import path from 'path'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const importRegexp = /^\s*import\s+(\w+)\s+from\s+(['"])([^"']+)\2(;|$)\n*/myg

const registry = {
  modules: {},
  extractDependencies(content, contentPath) {
    const dependencies = {}
    content = content.replace(importRegexp, function(match, alias, _, importPath) {
      const modulePath = path.join(path.dirname(contentPath), importPath) + (importPath.endsWith('.js') ? '' : '.js')
      const moduleId = path.relative(__dirname, modulePath)
      dependencies[moduleId] = alias

      if (!registry.modules[moduleId]) {
        const moduleSource = fs.readFileSync(modulePath, 'utf-8')
        registry.modules[moduleId] = registry.extractDependencies(moduleSource, modulePath)
      }

      return ''
    })
    return {content, dependencies}
  }
}

export default registry