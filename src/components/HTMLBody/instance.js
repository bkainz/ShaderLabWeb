const loaderLoadedCallbacks = []
window.requireAvailable = loaderLoadedCallbacks.push.bind(loaderLoadedCallbacks)

const loaderScriptEl = document.createElement('script')
loaderScriptEl.src = '/monaco-editor/min/vs/loader.js'
loaderScriptEl.addEventListener('load', e => {
  window.requireAvailable = function(callback){ callback() }
  let callback; while (callback = loaderLoadedCallbacks.shift()) callback()
})
document.head.appendChild(loaderScriptEl)

window.requireAvailable(() => require(['https://unpkg.com/htmx.org@1.5.0?noext'], htmx => window.htmx = htmx))

function HTMLBody(el) {
  this.el = el
}

export default HTMLBody