import React from 'react'
import escapeCSS from '../../componentHelpers/escapeCSS'

import Initializer from '../Initializer'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <div className={className} id={id} hx-trigger="load, submit" hx-get={`/${props.resource}/list`} hx-target={`#${escapeCSS(id+'-ListItems')}`}>
    {props.filters.length
      ? <form className={className+'-Filters'}>
          <div className={className+'-FiltersLabel'}>filter by:&nbsp;</div>
          <ul className={className+'-FiltersList'}>{props.filters.map(filter =>
            <li className={className+'-FilterItem'} key={filter.name} tabIndex="-1">
              <div className={className+'-FilterName'}>{filter.title}</div>
              <div className={className+'-FilterContent'}>
                <div className={className+'-FilterContentScroll'}>
                  <div className={className+'-FilterContentPadding'}>
                    { Array.isArray(filter.options) ?
                        filter.options.map(option =>
                          <div className={className+'-FilterValue'} key={String(option.id)}>
                            <input type="checkbox" name={filter.name} value={String(option.id)} className={className+'-FilterCheckbox'} id={`${id}-FilterCheckbox-${filter.name}-${option.id}`} defaultChecked={props.state.filters[filter.name] === option.id}/>
                            <label htmlFor={`${id}-FilterCheckbox-${filter.name}-${option.id}`} className={className+'-FilterLabel'}>{option.name}</label>
                          </div>
                        )
                    : filter.options === 'date' ?
                        <input type="date" className={className+'-FilterValue'} name={filter.name} defaultValue={(props.state.filters[filter.name] || new Date()).toISOString().split('T')[0]} required/>
                    : function(){ throw new Error('invalid filter type')}() }
                  </div>
                </div>
              </div>
            </li>)}
          </ul>
        </form>
      : ''}
    <div className={className+'-ListItems'} id={id+'-ListItems'}/>
    <Initializer/>
  </div>
)