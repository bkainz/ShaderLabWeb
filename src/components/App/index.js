import React from 'react'

export default function(props) {
  global.usedComponents.add(import.meta)

  return <body className="App">
           {props.children}
         </body>
}