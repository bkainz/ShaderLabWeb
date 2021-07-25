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

    this.statesEl.addEventListener('change', e => this.focus(e.target.id))
    const selectedState = this.el.querySelector(`.${escapeCSS(this.className)}-State:checked`)
    selectedState && this.focus(selectedState.id)
  },

  focus(id) {
    const selector = typeof id === 'number' ? `:nth-child(${id+1})` : `#${escapeCSS(id)}`
    const stateEl = this.el.querySelector(`.${escapeCSS(this.className)}-State${selector}`)
    stateEl.checked = true

    const selectedTab = this.el.querySelector(`.${escapeCSS(this.className)}-Tab.selected`)
    selectedTab && selectedTab.classList.remove('selected')
    this.el.querySelector(`.${escapeCSS(this.className)}-Tab[data-for="${stateEl.id}"]`).classList.add('selected')

    const selectedCard = this.el.querySelector(`.${escapeCSS(this.className)}-Card.selected`)
    selectedCard && selectedCard.classList.remove('selected')
    this.el.querySelector(`.${escapeCSS(this.className)}-Card[data-for="${stateEl.id}"]`).classList.add('selected')
  },

  add(meshId, passId, tabs) {
    let passGroupHeaderEl = this.el.querySelector(`.${escapeCSS(this.className)}-PassGroupHeader.${escapeCSS(meshId)}`)
    let passGroupAddButtonEl = this.el.querySelector(`.${escapeCSS(this.className)}-AddPassButton.${escapeCSS(meshId)}`)
    if (!passGroupHeaderEl) {
      passGroupHeaderEl = document.createElement('header')
      passGroupHeaderEl.className = this.className+'-PassGroupHeader '+meshId
      passGroupHeaderEl.innerText = meshId
      this.passesEl.appendChild(passGroupHeaderEl)

      passGroupAddButtonEl = document.createElement('button')
      passGroupAddButtonEl.type = 'button'
      passGroupAddButtonEl.className = this.className+'-AddPassButton '+meshId
      passGroupAddButtonEl.innerText = '+'
      passGroupAddButtonEl.addEventListener('click', e => {
        let passId = 'Pass', i = 0
        while (this.editor.passes[meshId][passId]) passId = 'Pass'+(i+=1)

        this.editor.addPass(meshId, passId)
      })
      this.passesEl.appendChild(passGroupAddButtonEl)
    }

    const passEl = document.createElement('div')
    passEl.id = this.id+'-Pass-'+[meshId, passId].join('-')
    passEl.className = this.className+'-Pass'
    passEl.innerHTML = `<div class="${this.className+'-PassHeader'}">
  <input type="text" size="1" class="${this.className+'-PassLabel'}" value="${passId}">
  <button type="button" class="${this.className+'-RemovePassButton'}"></button>
</div>`
    this.passesEl.insertBefore(passEl, passGroupAddButtonEl)

    const passLabelEl = passEl.querySelector(`.${escapeCSS(this.className)+'-PassLabel'}`)
    let oldPassId = passId
    passLabelEl.addEventListener('change', e => {
      try {
        this.editor.renamePass(meshId, oldPassId, e.target.value)
        oldPassId = e.target.value
      } catch(e) {
        passLabelEl.value = oldPassId
        passLabelEl.setCustomValidity(e.message)
        passLabelEl.reportValidity()
        passLabelEl.setCustomValidity('')
      }
    })

    const removePassButtonEl = passEl.querySelector(`.${escapeCSS(this.className)+'-RemovePassButton'}`)
    removePassButtonEl.addEventListener('click', e => {
      this.editor.removePass(meshId, passId)
    })

    const tabsEl = document.createElement('ul')
    tabsEl.className = this.className+'-PassTabs'
    passEl.appendChild(tabsEl)

    for (const tab of tabs) {
      const stateEl = document.createElement('input')
      stateEl.type = 'radio'
      stateEl.form = this.id+'-State'
      stateEl.name = this.id+'-State-Tab'
      stateEl.className = this.className+'-State'
      stateEl.id = [this.id, 'State', meshId, passId, tab.label].join('-')
      this.statesEl.appendChild(stateEl)

      const tabEl = document.createElement('li')
      tabEl.className = this.className+'-Tab'
      tabEl.id = [this.id, 'Tab', meshId, passId, tab.label].join('-')
      tabEl.dataset.for = [this.id, 'State', meshId, passId, tab.label].join('-')
      tabsEl.appendChild(tabEl)

      const tabLabelEl = document.createElement('label')
      tabLabelEl.className = this.className+'-TabLabel'
      tabLabelEl.htmlFor = [this.id, 'State', meshId, passId, tab.label].join('-')
      tabLabelEl.innerText = tab.label
      tabEl.appendChild(tabLabelEl)

      const cardEl = document.createElement('li')
      cardEl.className = this.className+'-Card'
      cardEl.id = [this.id, 'Card', meshId, passId, tab.label].join('-')
      cardEl.dataset.for = [this.id, 'State', meshId, passId, tab.label].join('-')
      this.cardsEl.appendChild(cardEl)
      cardEl.appendChild(tab.content)
    }
  },

  remove(meshId, passId) {
    this.el.querySelector(`#${escapeCSS([this.id, 'State', meshId, passId, 'vertex'].join('-'))}`).remove()
    this.el.querySelector(`#${escapeCSS([this.id, 'State', meshId, passId, 'fragment'].join('-'))}`).remove()
    this.el.querySelector(`#${escapeCSS([this.id, 'Card', meshId, passId, 'vertex'].join('-'))}`).remove()
    this.el.querySelector(`#${escapeCSS([this.id, 'Card', meshId, passId, 'fragment'].join('-'))}`).remove()
    this.el.querySelector(`#${escapeCSS([this.id, 'Pass', meshId, passId].join('-'))}`).remove()
  }
}

export default Tabs