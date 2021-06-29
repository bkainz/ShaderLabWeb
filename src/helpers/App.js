import fs from 'fs'
import url from 'url'
import path from 'path'

global.rootDir = path.dirname(path.dirname(path.dirname(url.fileURLToPath(import.meta.url))))
const dataDir = path.join(global.rootDir, 'data')
!fs.existsSync(dataDir) && fs.mkdirSync(dataDir)

export default class {}