import React from 'react'
import compReg from '../../componentRegistry'
import Canvas from './Canvas'
import Controls from './Controls'
import Editor from './Editor'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <body className={className} id={id}>
           <section className={className+'-CanvasPanel'}>
             <Canvas/>
           </section>
           <section className={className+'-ControlsPanel'}>
             <Controls/>
           </section>
           <section className={className+'-EditorPanel'}>
             <Editor/>
           </section>
           <section className={className+'-VerticalBorder'}/>
           <section className={className+'-HorizontalBorder'}/>
         </body>
}