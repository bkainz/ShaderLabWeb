import React from 'react'
import Canvas from './Canvas'
import Controls from './Controls'
import Editor from './Editor'
import Initializer from '../Initializer'
import Header from './Header'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <header className={className+'-Header'}>
      <Header/>
    </header>
    <div className={className+'-Content'}>
      <section className={className+'-EditorPanel'}>
        <Editor/>
      </section>
      <section className={className+'-ControlsPanel'}>
        <Controls/>
      </section>
      <section className={className+'-CanvasPanel'}>
        <Canvas/>
      </section>
      <section className={className+'-VerticalBorder'}/>
      <section className={className+'-HorizontalBorder'}/>
    </div>
    <Initializer/>
  </div>
)