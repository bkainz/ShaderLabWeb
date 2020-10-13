module.exports = function(el, {className}) {
  this.el = el

  const verticalBorderEl = el.querySelector(`.${className}-VerticalBorder`)
  const horizontalBorderEl = el.querySelector(`.${className}-HorizontalBorder`)

  verticalBorderEl.addEventListener('mousedown', e => {
    function resize(e) {
      const bb = el.getBoundingClientRect()
      el.style.gridTemplateColumns = ((bb.left+e.clientX)/bb.width * 100)+'% 0 1fr'
    }

    verticalBorderEl.classList.add('active')
    verticalBorderEl.addEventListener('mousemove', resize)
    verticalBorderEl.addEventListener('mouseup', e => {
      verticalBorderEl.classList.remove('active')
      verticalBorderEl.removeEventListener('mousemove', resize)
    })
  })

  horizontalBorderEl.addEventListener('mousedown', e => {
    function resize(e) {
      const bb = el.getBoundingClientRect()
      el.style.gridTemplateRows = ((bb.top+e.clientY)/bb.height * 100)+'% 0 1fr'
    }

    horizontalBorderEl.classList.add('active')
    horizontalBorderEl.addEventListener('mousemove', resize)
    horizontalBorderEl.addEventListener('mouseup', e => {
      horizontalBorderEl.classList.remove('active')
      horizontalBorderEl.removeEventListener('mousemove', resize)
    })
  })
}