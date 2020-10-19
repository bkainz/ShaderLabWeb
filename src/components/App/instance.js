module.exports = function(el, {className}) {
  this.el = el

  window.addEventListener('resize', e => el.dispatchEvent(new Event('resized')))

  const verticalBorderEl = el.querySelector(`.${className}-VerticalBorder`)
  verticalBorderEl.addEventListener('mousedown', e => {
    function resize(e) {
      const bb = el.getBoundingClientRect()
      el.style.gridTemplateColumns = ((bb.left+e.clientX)/bb.width * 100)+'% 0 1fr'
      el.dispatchEvent(new Event('resized'))
    }

    verticalBorderEl.classList.add('active')
    verticalBorderEl.addEventListener('mousemove', resize)
    verticalBorderEl.addEventListener('mouseup', e => {
      verticalBorderEl.classList.remove('active')
      verticalBorderEl.removeEventListener('mousemove', resize)
    })
  })

  const horizontalBorderEl = el.querySelector(`.${className}-HorizontalBorder`)
  horizontalBorderEl.addEventListener('mousedown', e => {
    function resize(e) {
      const bb = el.getBoundingClientRect()
      el.style.gridTemplateRows = ((bb.top+e.clientY)/bb.height * 100)+'% 0 1fr'
      el.dispatchEvent(new Event('resized'))
    }

    horizontalBorderEl.classList.add('active')
    horizontalBorderEl.addEventListener('mousemove', resize)
    horizontalBorderEl.addEventListener('mouseup', e => {
      horizontalBorderEl.classList.remove('active')
      horizontalBorderEl.removeEventListener('mousemove', resize)
    })
  })
}