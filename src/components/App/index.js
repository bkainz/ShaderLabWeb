import React from 'react'
import compReg from '../../componentRegistry'
import Canvas from './Canvas'
import Controls from './Controls'
import Editor from './Editor'
import Initializer from './Initializer'

export default function() {
  const props = {
    passes: {
      base: {
        name: 'Base Pass',
        geometry: 'objects/teapot.obj',
        shaders: {
          vertex: {
            name: 'Vertex Shader',
            default: `
attribute vec3 vertex_worldSpace;
attribute vec3 normal_worldSpace;
attribute vec2 textureCoordinate_input;

uniform mat4 mMatrix /* attach to: Model Matrix */;
uniform mat4 vMatrix /* attach to: View Matrix */;
uniform mat4 pMatrix /* attach to: Projection Matrix */;

varying vec3 normal;

void main() {
  vec4 vertex_camSpace = vMatrix * mMatrix * vec4(vertex_worldSpace, 1.0);
  gl_Position = pMatrix * vertex_camSpace;

  normal = normal_worldSpace;
}`.trim()
          },
          fragment: {
            name: 'Fragment Shader',
            default: `
precision mediump float;

varying vec3 normal;

void main() {
  gl_FragColor = vec4(0.5 + 0.5*normal, 1.0);
}`.trim()
          }
        }
      },
      R2T: {
        name: 'R2T Pass',
        geometry: 'quad',
        shaders: {
          vertex: {
            name: 'R2T Vertex Shader',
            default: `
attribute vec3 vertex_worldSpace;
attribute vec2 textureCoordinate_input;

varying vec2 varyingTextureCoordinate;

void main() {
  gl_Position = vec4(vertex_worldSpace, 1.0);
  varyingTextureCoordinate = textureCoordinate_input;
}`.trim()
          },
          fragment: {
            name: 'R2T Fragment Shader',
            default: `
precision mediump float;

uniform sampler2D textureRendered /* attach to: Base Pass color */;

varying vec2 varyingTextureCoordinate;

void main() {
  gl_FragColor = texture2D(textureRendered, varyingTextureCoordinate.st);
}`.trim()
          }
        }
      }
    }
  }
  const {className, id} = compReg.register(import.meta.url, props)

  return <body className={className} id={id}>
           <section className={className+'-EditorPanel'}>
             <Editor passes={props.passes}/>
           </section>
           <section className={className+'-CanvasPanel'}>
             <Canvas passes={props.passes}/>
           </section>
           <section className={className+'-ControlsPanel'}>
             <Controls/>
           </section>
           <section className={className+'-VerticalBorder'}/>
           <section className={className+'-HorizontalBorder'}/>
           <Initializer/>
         </body>
}