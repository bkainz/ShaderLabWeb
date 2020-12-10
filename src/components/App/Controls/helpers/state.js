import escapeCSS from '../../../../helpers/escapeCSS'

export default {
  initializeForPrototype(prototype, fields) {
    for (const field in fields) {
      const config = fields[field]
      config.isArray = /^(?:[ib]?vec|mat)[234]$/.test(config.type)
      config.isNumeric = /^(?:(?:[ib]?vec|mat)[234]|int|bool|float)$/.test(config.type)
    }

    for (const field in fields) {
      const config = fields[field]

      Object.defineProperty(prototype, field, {
        get() {
          return this.app.getValue(config.type, config.name)
        },
        set(value) {
          this.app.setValue(config.type, config.name, !config.isNumeric ? value
                                                    : !config.isArray   ? Number(value)
                                                    :                     value.map(Number))
        }
      })
    }

    Object.defineProperty(prototype, 'state', {
      get() {
        const state = {}
        for (const field in fields) state[field] = this[field]
        return state
      },
      set(state) {
        for (const field in fields) this[field] = state[field]
      }
    })
  },

  initializeForInstance(instance, fields) {
    for (const field in fields) {
      const config = fields[field]

      const els = Array.from(instance.el.querySelectorAll(`.${escapeCSS(instance.className)}-FieldInput.${field}`))
      els.forEach(el => el.addEventListener('change', e => instance[field] = config.isArray ? els.map(el => getInputValue(el))
                                                                                            : getInputValue(els[0])))

      instance.app.onChangedValue(config.type, config.name, value => {
        const valueByEl = Array.isArray(value) ? value : [value]
        els.forEach((el, idx) => setInputValue(el, config.isNumeric ? Math.round(valueByEl[idx]*1000)/1000 : valueByEl[idx] || ''))
        config.onChange && config.onChange.call(instance, value)
      })
    }
  }
}

function getInputValue(inputEl) {
  return inputEl.type === 'radio' || inputEl.type === 'checkbox' ? inputEl.checked
                                                                 : inputEl.value
}

function setInputValue(inputEl, value) {
  return inputEl.type === 'radio' || inputEl.type === 'checkbox' ? inputEl.checked = Boolean(value)
                                                                 : inputEl.value = value
}