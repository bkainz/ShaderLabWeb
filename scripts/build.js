import fs from 'fs'
import path from 'path'
import url from 'url'
import renderHTMLPage from '../_transpiled/_renderer/renderHTMLPage'
import App from '../_transpiled/components/App'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __rootdir = path.dirname(__dirname)

const publicDir = path.join(__rootdir, 'public')
fs.existsSync(publicDir) && fs.rmdirSync(publicDir, {recursive: true})
fs.mkdirSync(publicDir)

fs.symlinkSync(path.join(__rootdir, 'assets'), path.join(publicDir, 'assets'))

fs.mkdirSync(path.join(publicDir, 'monaco-editor'))
fs.symlinkSync(path.join(__rootdir, 'node_modules/monaco-editor/min'), path.join(publicDir, 'monaco-editor/min'))
fs.symlinkSync(path.join(__rootdir, 'node_modules/monaco-editor/min-maps'), path.join(publicDir, 'monaco-editor/min-maps'))

renderHTMLPage({
  meta: `<title>ShaderLabWeb</title>
         <meta name="robots" content="noindex, nofollow">`.replace(/\n {11}/, '\n'),
  Body: App
})().then(html => fs.promises.writeFile(path.join(publicDir, 'index.html'), html))