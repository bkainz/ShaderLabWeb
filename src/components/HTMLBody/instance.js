const htmxScriptEl = document.createElement('script')
htmxScriptEl.src = 'https://unpkg.com/htmx.org@1.5.0'
document.head.appendChild(htmxScriptEl)

function HTMLBody(el) {
  this.el = el
}

export default HTMLBody