function createCallPromise(name, promises, resolvers) {
  promises[name] = promises[name] || new Promise(resolve => resolvers[name] = resolve)
  return {resolver: resolvers[name], promise: promises[name]}
}

class CallbackRegistry {
  constructor() {
    this.callbacks = {}
    this.forerunners = {}
  }

  register(name, func, {requires = Symbol.for('root')} = {}) {
    if (this.callbacks[name]) throw new Error(`callback with name '${name}' already registered`)

    this.callbacks[name] = func
    this.forerunners[name] = this.forerunners[name] || {}

    for (const requirement of Array.isArray(requires) ? requires : [requires]) {
      this.forerunners[requirement] = this.forerunners[requirement] || {}
      this.forerunners[requirement][name] = true
    }
  }

  deregister(name) {
    for (const requirement in this.forerunners) delete this.forerunners[requirement][name]
    delete this.forerunners[name]
    delete this.callbacks[name]
  }

  call(...args) {
    const promises = {}, resolvers = {}
    for (const name in this.callbacks) {
      const {resolver} = createCallPromise(name, promises, resolvers)
      const forerunners = Object.keys(this.forerunners[name]).map(name => createCallPromise(name, promises, resolvers).promise)
      Promise.all(forerunners).then(() => (console.log(`[${name}] ending...`), Promise.resolve(this.callbacks[name](...args)))
                              .then(() => (console.log(`[${name}] ended`), resolver())))
    }
    return Promise.all(Object.values(promises))
  }
}

export default CallbackRegistry