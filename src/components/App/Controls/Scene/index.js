import React from 'react'
import compReg from '../../../../componentRegistry'
import Geometry from './Geometry'
import Camera from './Camera'

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
           <section className={className+'/Section'}>
             <header className={className+'/Section-Name'}>
               Camera
             </header>
             <div className={className+'/Section-Content'}>
               <Camera/>
             </div>
           </section>
         </div>
}