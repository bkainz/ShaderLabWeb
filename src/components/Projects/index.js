import React from 'react'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <div className={className} id={id}>
    {props.items && props.items.length
      ? <>
          <div className={className+'-Header'}>
            <div className={className+'-Column name'}>
              Name
            </div>
            <div className={className+'-Column savedAt'}>
              Last Save
            </div>
          </div>
          {props.items.map(item =>
            <a key={item.id} href={`/projects/${item.id}`} className={className+'-Item'}>
              <div className={className+'-Column name'}>
                {item.name}
              </div>
              <div className={className+'-Column savedAt'}>
                {item.savedAt.toLocaleString('en-GB', {timeZone: 'Europe/London'})}
              </div>
            </a>
          )}
        </>
      : ''}
  </div>
)