import escapeCSS from '../../../../../helpers/escapeCSS'

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
          return this.app.values[config.type][config.name].value
        },
        set(value) {
          this.app.values[config.type][config.name].value = !config.isNumeric ? value
                                                          : !config.isArray   ? Number(value)
                                                          :                     value.map(Number)
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
      els.forEach(el => el.addEventListener('input', e => instance[field] = config.isArray ? els.map(el => el.value)
                                                                                           : els[0].value))

      instance.app.registerValue(config.name, config.type)
      instance.app.values[config.type][config.name].el.addEventListener('valueChanged', ({detail: value}) => {
        const valueByEl = Array.isArray(value) ? value : [value]
        els.forEach((el, idx) => el.value = valueByEl[idx])
        config.onChange && config.onChange.call(instance)
      })
    }
  }
}