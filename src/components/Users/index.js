import React from 'react'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <div className={className} id={id}>
    {props.items && props.items.length
      ? <>
          <div className={className+'-Header'}>
            <div className={className+'-Column id'}>
              Id
            </div>
            <div className={className+'-Column username'}>
              Username
            </div>
          </div>
          {props.items.map(item =>
            <a key={item.id} href={`/users/${item.id}`} className={className+'-Item'}>
              <div id={id} className={className+'-Column id'}>
                {item.id}
              </div>
              <div id={id} className={className+'-Column username'}>
                {item.username}
              </div>
            </a>)}
        </>
      : ''}
  </div>
)