import React from 'react'
import compReg from '../../componentRegistry'
import Canvas from './Canvas'
import Controls from './Controls'
import Editor from './Editor'
import Initializer from './Initializer'
import Header from './Header'

export default function() {
  const props = {
    passes: {
      base: {
        name: 'Base Pass',
        geometry: 'assets/teapot.obj',
        shaders: {
          vertex: {
            name: 'Vertex Shader'
          },
          fragment: {
            name: 'Fragment Shader'
          }
        }
      },
      R2T: {
        name: 'R2T Pass',
        geometry: 'quad',
        shaders: {
          vertex: {
            name: 'R2T Vertex Shader'
          },
          fragment: {
            name: 'R2T Fragment Shader'
          }
        }
      }
    }
  }
  const {className, id} = compReg.register(import.meta.url, props)

  return <body className={className} id={id}>
           <header className={className+'-Header'}>
             <Header/>
           </header>
           <div className={className+'-Content'}>
             <section className={className+'-EditorPanel'}>
               <Editor passes={props.passes}/>
             </section>
             <section className={className+'-ControlsPanel'}>
               <Controls/>
             </section>
             <section className={className+'-CanvasPanel'}>
               <Canvas passes={props.passes}/>
             </section>
             <section className={className+'-VerticalBorder'}/>
             <section className={className+'-HorizontalBorder'}/>
           </div>
           <Initializer/>
         </body>
}