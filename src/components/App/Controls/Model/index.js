import React from 'react'
import compReg from '../../../../componentRegistry'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <div className={className} id={id}>
           <section className={className+'/Section'}>
             <header className={className+'/Section-Name'}>
               Position & Transform
             </header>
             <div className={className+'/Section-Content'}>
               <p className={className+'/Section-ContentInfo'}>
                 The Model Matrix is calculated as: Model Matrix = Position * Rotation * Scale.
               </p>
               <div className={className+'-Field position'}>
                 <div className={className+'-FieldLabel'}>
                   Position:
                 </div>
                 <div className={className+'-FieldValue'}>
                   <input type="number" defaultValue="0" step="any" className={className+'-FieldInput position x'}/>
                   <input type="number" defaultValue="0" step="any" className={className+'-FieldInput position y'}/>
                   <input type="number" defaultValue="0" step="any" className={className+'-FieldInput position z'}/>
                 </div>
               </div>
               <div className={className+'-Field rotationAxis'}>
                 <div className={className+'-FieldLabel'}>
                   Rotation Axis:
                 </div>
                 <div className={className+'-FieldValue'}>
                   <input type="number" defaultValue="0" step="any" className={className+'-FieldInput rotationAxis x'}/>
                   <input type="number" defaultValue="0" step="any" className={className+'-FieldInput rotationAxis y'}/>
                   <input type="number" defaultValue="1" step="any" className={className+'-FieldInput rotationAxis z'}/>
                 </div>
               </div>
               <div className={className+'-Field rotationAngle'}>
                 <div className={className+'-FieldLabel'}>
                   Rotation Angle:
                 </div>
                 <div className={className+'-FieldValue'}>
                   <input type="number" defaultValue="0" step="any" className={className+'-FieldInput rotationAngle'}/>
                 </div>
               </div>
               <div className={className+'-Field scale'}>
                 <div className={className+'-FieldLabel'}>
                   Scale:
                 </div>
                 <div className={className+'-FieldValue'}>
                   <input type="number" defaultValue="1" step="any" className={className+'-FieldInput scale x'}/>
                   <input type="number" defaultValue="1" step="any" className={className+'-FieldInput scale y'}/>
                   <input type="number" defaultValue="1" step="any" className={className+'-FieldInput scale z'}/>
                 </div>
               </div>
             </div>
           </section>
           <section className={className+'/Section'}>
             <header className={className+'/Section-Name'}>
               Render Options
             </header>
             <div className={className+'/Section-Content'}>
               <div className={className+'-Field depth-test'}>
                 <div className={className+'-FieldLabel'}>
                   Depth Test:
                 </div>
                 <div className={className+'-FieldValue'}>
                   <select className={className+'-FieldInput depthTest'}>
                     <option value="">Disabled</option>
                     <option value="NEVER">Never</option>
                     <option value="LESS" selected={true}>Less</option>
                     <option value="LEQUAL">Less Or Equal</option>
                     <option value="EQUAL">Equal</option>
                     <option value="NOTEQUAL">Not Equal</option>
                     <option value="GEQUAL">Greater Or Equal</option>
                     <option value="GREATER">Greater</option>
                     <option value="ALWAYS">Always</option>
                   </select>
                 </div>
               </div>
               <div className={className+'-Field front-face'}>
                 <div className={className+'-FieldLabel'}>
                   Front Face:
                 </div>
                 <div className={className+'-FieldValue'}>
                   <select className={className+'-FieldInput frontFace'}>
                     <option value="CCW">Counter-clock-wise winding</option>
                     <option value="CW">Clock-wise winding</option>
                   </select>
                 </div>
               </div>
               <div className={className+'-Field face-culling'}>
                 <div className={className+'-FieldLabel'}>
                   Face Culling:
                 </div>
                 <div className={className+'-FieldValue'}>
                   <select className={className+'-FieldInput faceCulling'}>
                     <option value="">Disabled</option>
                     <option value="BACK">Back</option>
                     <option value="FRONT">Front</option>
                     <option value="FRONT_AND_BACK">Front & Back</option>
                   </select>
                 </div>
               </div>
             </div>
           </section>
         </div>
}