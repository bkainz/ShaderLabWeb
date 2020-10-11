import React from 'react'
import compReg from '../../../componentRegistry'
import Tabs from '../Tabs'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <div className={className} id={id}>
           <Tabs tabs={[{label: 'Vertex Shader',
                         content: <textarea className="App/Editor-Textarea" defaultValue="Vertex Shader"/>},
                        {label: 'Fragment Shader',
                         content: <textarea className="App/Editor-Textarea" defaultValue="Fragment Shader"/>},
                        {label: 'R2T Vertex Shader',
                         content: <textarea className="App/Editor-Textarea" defaultValue="R2T Vertex Shader"/>},
                        {label: 'R2T Fragment Shader',
                         content: <textarea className="App/Editor-Textarea" defaultValue="R2T Fragment Shader"/>}]}/>
         </div>
}