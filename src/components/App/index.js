import React from 'react'
import Canvas from './Canvas'
import Controls from './Controls'
import Editor from './Editor'
import Shader from './Editor/Shader'
import Initializer from '../Initializer'

import fs from 'fs'
import path from 'path'
const defaultStatesPath = path.join(global.rootDir, 'defaultStates')
const defaultStates = fs.readdirSync(defaultStatesPath).reduce((shaders, filename) => {
  const basename = path.basename(filename, path.extname(filename))
  shaders[basename] = shaders[basename] || {}
  shaders[basename] = JSON.parse(fs.readFileSync(path.join(defaultStatesPath, filename), 'utf-8'))
  return shaders
}, {})

export default Component.register(import.meta.url, ({className, id, props}) =>
  <div className={className} id={id}>
    <input type="hidden" form={props.form} name="state" value={props.state} className={className+'-State'} autoComplete="off"/>
    <section className={className+'-EditorPanel'}>
      <Editor Shader={Shader.registerTemplate()} defaultStates={defaultStates}/>
    </section>
    <section className={className+'-ControlsPanel'}>
      <Controls/>
    </section>
    <section className={className+'-CanvasPanel'}>
      <Canvas/>
    </section>
    <section className={className+'-VerticalBorder'}/>
    <section className={className+'-HorizontalBorder'}/>
    <Initializer/>
  </div>
)