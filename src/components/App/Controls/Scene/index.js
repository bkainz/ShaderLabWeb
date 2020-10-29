import React from 'react'
import compReg from '../../../../componentRegistry'
import Geometry from './Geometry'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <div className={className} id={id}>
           <section className={className+'/Section'}>
             <header className={className+'/Section-Name'}>
               Geometry
             </header>
             <div className={className+'/Section-Content'}>
               <Geometry/>
             </div>
           </section>
         </div>
}