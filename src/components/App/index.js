import React from 'react'
import compReg from '../../componentRegistry'
import Canvas from './Canvas'
import Controls from './Controls'
import Editor from './Editor'
import Initializer from './Initializer'

export default function() {
  const props = {
    shaders: [{
      stage: 'base',
      name: 'Vertex Shader',
      type: 'vertex',
      default: 'void main(){}'
    },{
      stage: 'base',
      name: 'Fragment Shader',
      type: 'fragment',
      default: 'void main(){}'
    },{
      stage: 'R2T',
      name: 'R2T Vertex Shader',
      type: 'vertex',
      default: 'void main(){}'
    },{
      stage: 'R2T',
      name: 'R2T Fragment Shader',
      type: 'fragment',
      default: 'void main(){}'
    }]
  }
  const {className, id} = compReg.register(import.meta.url, props)

  return <body className={className} id={id}>
           <section className={className+'-EditorPanel'}>
             <Editor shaders={props.shaders}/>
           </section>
           <section className={className+'-ControlsPanel'}>
             <Controls/>
           </section>
           <section className={className+'-CanvasPanel'}>
             <Canvas shaders={props.shaders}/>
           </section>
           <section className={className+'-VerticalBorder'}/>
           <section className={className+'-HorizontalBorder'}/>
           <Initializer/>
         </body>
}