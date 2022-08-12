import escapeCSS from '../../../../componentHelpers/escapeCSS'

function Tabs(el, {className, id, ancestors}) {
  this.el = el
  this.className = className
  this.id = id

  this.editor = ancestors.find(ancestor => ancestor.className === 'components/App/Editor')
}

Tabs.prototype = {
  initialize() {
    this.statesEl = this.el.querySelector(`.${escapeCSS(this.className)}-States`)
    this.passesEl = this.el.querySelector(`.${escapeCSS(this.className)}-Passes`)
    this.cardsEl = this.el.querySelector(`.${escapeCSS(this.className)}-Cards`)

    this.statesEl.addEventListener('change', e => this.focus(e.target.value))
    const selectedState = this.el.querySelector(`.${escapeCSS(this.className)}-State:checked`)
    selectedState && this.focus(selectedState.id)
  },

  focus(id) {
    const selector = typeof id === 'number' ? `:nth-child(${id+1})` : `[value="${id}"]`
    const stateEl = this.el.querySelector(`.${escapeCSS(this.className)}-State${selector}`)
    stateEl.checked = true

    const selectedTab = this.el.querySelector(`.${escapeCSS(this.className)}-Tab.selected`)
    selectedTab && selectedTab.classList.remove('selected')
    this.el.querySelector(`.${escapeCSS(this.className)}-Tab[data-for="${stateEl.id}"]`).classList.add('selected')

    const selectedCard = this.el.querySelector(`.${escapeCSS(this.className)}-Card.selected`)
    selectedCard && selectedCard.classList.remove('selected')
    this.el.querySelector(`.${escapeCSS(this.className)}-Card[data-for="${stateEl.id}"]`).classList.add('selected')
  },

  add(pass) {
    let passGroupHeaderEl = this.el.querySelector(`.${escapeCSS(this.className)}-PassGroupHeader.${escapeCSS(pass.meshId)}`)
    let passGroupAddButtonEl = this.el.querySelector(`.${escapeCSS(this.className)}-AddPassButton.${escapeCSS(pass.meshId)}`)
    if (!passGroupHeaderEl) {
      passGroupHeaderEl = document.createElement('header')
      passGroupHeaderEl.className = this.className+'-PassGroupHeader '+pass.meshId
      passGroupHeaderEl.innerText = pass.meshId
      this.passesEl.appendChild(passGroupHeaderEl)

      passGroupAddButtonEl = document.createElement('button')
      passGroupAddButtonEl.type = 'button'
      passGroupAddButtonEl.className = this.className+'-AddPassButton '+pass.meshId
      passGroupAddButtonEl.innerText = '+'
      passGroupAddButtonEl.addEventListener('click', e => this.editor.addPass(pass.meshId, this.editor.buildNewPassName(pass.meshId)))
      this.passesEl.appendChild(passGroupAddButtonEl)
    }

    const passEl = document.createElement('div')
    passEl.id = this.id+'-Pass-'+pass.id
    passEl.className = this.className+'-Pass'
    passEl.innerHTML = `<div class="${this.className+'-PassHeader'}">
  <input type="text" size="1" class="${this.className+'-PassLabel'}" value="${pass.name}">
  <button type="button" class="${this.className+'-RemovePassButton'}"></button>
</div>`
    this.passesEl.insertBefore(passEl, passGroupAddButtonEl)

    const passLabelEl = passEl.querySelector(`.${escapeCSS(this.className)+'-PassLabel'}`)
    let oldPassName = passLabelEl.value
    passLabelEl.addEventListener('input', e => {
      passLabelEl.setCustomValidity('')
      const newName = e.target.value.trim()
      if (newName === pass.name) return
      if (!this.editor.isPassNameTaken(pass.meshId, newName)) return
      passLabelEl.setCustomValidity(`Pass name "${newName}" already taken`)
      passLabelEl.reportValidity()
    })
    passLabelEl.addEventListener('change', e => {
      const newName = e.target.value.trim()
      if (this.editor.isPassNameTaken(pass.meshId, newName)) {
        passLabelEl.value = oldPassName
        passLabelEl.setCustomValidity('')
        passLabelEl.blur() // close validity report
        passLabelEl.select()
      }
      else {
        this.editor.renamePass(pass.id, newName)
        passLabelEl.value = newName
        oldPassName = newName
      }
    })

    const removePassButtonEl = passEl.querySelector(`.${escapeCSS(this.className)+'-RemovePassButton'}`)
    removePassButtonEl.addEventListener('click', e => this.editor.removePass(pass.id))

    const tabsEl = document.createElement('ul')
    tabsEl.className = this.className+'-PassTabs'
    passEl.appendChild(tabsEl)

    for (const type in pass.shaders) {
      const stateEl = document.createElement('input')
      stateEl.type = 'radio'
      stateEl.form = this.id+'-State'
      stateEl.name = this.id+'-State-Tab'
      stateEl.value = pass.id+'-'+type
      stateEl.className = this.className+'-State'
      stateEl.id = [this.id, 'State', pass.id, type].join('-')
      this.statesEl.appendChild(stateEl)

      const tabEl = document.createElement('li')
      tabEl.className = this.className+'-Tab'
      tabEl.id = [this.id, 'Tab', pass.id, type].join('-')
      tabEl.dataset.for = [this.id, 'State', pass.id, type].join('-')
      tabsEl.appendChild(tabEl)

      const tabLabelEl = document.createElement('label')
      tabLabelEl.className = this.className+'-TabLabel'
      tabLabelEl.htmlFor = [this.id, 'State', pass.id, type].join('-')
      tabLabelEl.innerText = type
      tabEl.appendChild(tabLabelEl)

      const cardEl = document.createElement('li')
      cardEl.className = this.className+'-Card'
      cardEl.id = [this.id, 'Card', pass.id, type].join('-')
      cardEl.dataset.for = [this.id, 'State', pass.id, type].join('-')
      this.cardsEl.appendChild(cardEl)
      cardEl.appendChild(pass.shaders[type].el)
    }
  },

  remove(pass) {
    for (const type in pass.shaders) {
      const stateEl = this.el.querySelector(`#${escapeCSS([this.id, 'State', pass.id, type].join('-'))}`)
      if (stateEl.checked) stateEl.previousElementSibling && this.focus(stateEl.previousElementSibling.value)
      stateEl.remove()
      this.el.querySelector(`#${escapeCSS([this.id, 'Card', pass.id, type].join('-'))}`).remove()
    }
    this.el.querySelector(`#${escapeCSS([this.id, 'Pass', pass.id].join('-'))}`).remove()
  }
}

export default Tabs