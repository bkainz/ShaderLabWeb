import React from 'react'
import Canvas from './Canvas'
import Controls from './Controls'
import Editor from './Editor'
import Shader from './Editor/Shader'
import Initializer from '../Initializer'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <div className={className} id={id}>
    <input type="hidden" form={props.form} name="state" value={props.state} className={className+'-State'}/>
    <section className={className+'-EditorPanel'}>
      <Editor Shader={Shader.registerTemplate()}/>
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