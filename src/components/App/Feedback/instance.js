function Feedback(el, {className, props, ancestors}) {
  this.el = el
  this.className = className
  this.props = props

  this.app = ancestors.find(ancestor => ancestor.className === 'components/App')
}

Feedback.prototype = {
  initialize() {
    this.el.addEventListener('submit', async e => {
      e.preventDefault()

      const screenshot = await new Promise(resolve => this.app.canvas.canvasEl.toBlob(blob => resolve(blob), 'image/png'))

      const formData = new FormData()
      formData.append('state', JSON.stringify(this.app.state))
      formData.append('screenshot', screenshot, 'screenshot.png')

      const feedback = await fetch('/feedback', {method: 'POST', body: formData}).then(response => response.text())

      this.app.log.append(`<hr data-text="Feedback">`, '', 'green')
      this.app.log.append('', feedback, 'green')
    })
  }
}

export default Feedback