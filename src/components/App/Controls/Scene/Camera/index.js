import React from 'react'
import compReg from '../../../../../componentRegistry'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <div className={className} id={id}>
           <div className={className+'-Field position'}>
             <div className={className+'-FieldLabel'}>
               Position:
             </div>
             <div className={className+'-FieldValue'}>
               <input type="number" defaultValue="0" step="any" className={className+'-FieldInput position.x'}/>
               <input type="number" defaultValue="0" step="any" className={className+'-FieldInput position.y'}/>
               <input type="number" defaultValue="40" step="any" className={className+'-FieldInput position.z'}/>
             </div>
           </div>
           <div className={className+'-Field target'}>
             <div className={className+'-FieldLabel'}>
               Target:
             </div>
             <div className={className+'-FieldValue'}>
               <input type="number" defaultValue="0" step="any" className={className+'-FieldInput target.x'}/>
               <input type="number" defaultValue="0" step="any" className={className+'-FieldInput target.y'}/>
               <input type="number" defaultValue="0" step="any" className={className+'-FieldInput target.z'}/>
             </div>
           </div>
           <div className={className+'-Field near-clipping'}>
             <div className={className+'-FieldLabel'}>
               Near Clipping Plane:
             </div>
             <div className={className+'-FieldValue'}>
               <input type="number" defaultValue="0.001" step="any" min="0" className={className+'-FieldInput near-clipping'}/>
             </div>
           </div>
           <div className={className+'-Field'}>
             <div className={className+'-FieldLabel far-clipping'}>
               Far Clipping Plane:
             </div>
             <div className={className+'-FieldValue'}>
               <input type="number" defaultValue="10000" step="any" min="0" className={className+'-FieldInput far-clipping'}/>
             </div>
           </div>
           <div className={className+'-Field projection'}>
             <div className={className+'-FieldLabel'}>
               Projection:
             </div>
             <div className={className+'-FieldValue'}>
               <select className={className+'-FieldInput projection'}>
                 <option defaultValue="Perspective">Perspective</option>
                 <option defaultValue="Orthographic">Orthographic</option>
               </select>
             </div>
           </div>
           <div className={className+'-Field perspective-fov'}>
             <div className={className+'-FieldLabel'}>
               Perspective FOV:
             </div>
             <div className={className+'-FieldValue'}>
               <input type="number" defaultValue="45" step="any" min="0" max="180" className={className+'-FieldInput perspective-fov'}/>
             </div>
           </div>
           <div className={className+'-Field orthographic-fov'}>
             <div className={className+'-FieldLabel'}>
               Orthographic "FOV":
             </div>
             <div className={className+'-FieldValue'}>
               <input type="number" defaultValue="30" step="any" min="0" className={className+'-FieldInput orthographic-fov'}/>
             </div>
           </div>
         </div>
}