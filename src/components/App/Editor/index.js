import React from 'react'
import Tabs from './Tabs'
import Initializer from '../../Initializer'
import Feedback from '../Feedback'

export default Component.register(import.meta.url, ({className, id}) => {
  return <div className={className} id={id}>
           <form className={className+'-Form'} id={id+'-Form'}>
             <Tabs tabs={[]}/>
           </form>
           <div className={className+'-Controls'}>
             <button className={className+'-CompileButton'} form={id+'-Form'}>Compile & Link</button>
             {/*<Feedback/>*/}
           </div>
           <Initializer/>
         </div>
})