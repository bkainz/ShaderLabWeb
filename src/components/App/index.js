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
      default: `
attribute vec3 vertex_worldSpace;
attribute vec3 normal_worldSpace;
attribute vec2 textureCoordinate_input;

uniform mat4 mvMatrix;
uniform mat4 pMatrix;

varying vec4 normal;

void main() {
  vec4 vertex_camSpace = mvMatrix * vec4(vertex_worldSpace, 1.0);
  gl_Position = pMatrix * vertex_camSpace;

  normal = vec4(normal_worldSpace, 1.0);
}`.trim()
    },{
      stage: 'base',
      name: 'Fragment Shader',
      type: 'fragment',
      default: `
precision mediump float;

varying vec4 normal;

void main() {
  gl_FragColor = 0.5 + 0.5*normal;
}`.trim()
    },{
      stage: 'R2T',
      name: 'R2T Vertex Shader',
      type: 'vertex',
      default: `
attribute vec3 vertex_worldSpace;
attribute vec2 textureCoordinate_input;

varying vec2 varyingTextureCoordinate;

void main() {
  gl_Position = vec4(vertex_worldSpace, 1.0);
  varyingTextureCoordinate = textureCoordinate_input;
}`.trim()
    },{
      stage: 'R2T',
      name: 'R2T Fragment Shader',
      type: 'fragment',
      default: `
precision mediump float;

uniform sampler2D textureRendered;

varying vec2 varyingTextureCoordinate;

void main() {
  gl_FragColor = texture2D(textureRendered, varyingTextureCoordinate.st);
}`.trim()
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