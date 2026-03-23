// ui/ConfiguratorUI.js
import Orchestrator from '../core/Orchestrator.js'

export default class ConfiguratorUI {
  constructor() {
    this.orchestrator = new Orchestrator()
    this.panel = null
    this.backBtn = null
    this.build()
  }

  // ── Build panel DOM once ─────────────────────────────────────────

  build() {
    this.panel = document.createElement('div')
    this.panel.id = 'configurator'
    document.body.appendChild(this.panel)

    this.backBtn = document.createElement('button')
    this.backBtn.id = 'configurator-back'
    this.backBtn.textContent = '← Back'
    this.backBtn.style.display = 'none'
    this.backBtn.addEventListener('click', () => {
      this.orchestrator.activeConfigurator?.close()
    })
    document.body.appendChild(this.backBtn)
  }

  // ── Open with config from any configurator ───────────────────────

  open(config) {

    this.orchestrator.environment.setTime('day', 1.0)
    this.orchestrator.environment.setWeather('clear', 1.0)

    const envControls = document.getElementById('env-controls')
    if (envControls) envControls.style.display = 'none'
    console.log('ConfiguratorUI open called', config)
    this.panel.innerHTML = ''

    // Title
    const title = document.createElement('h2')
    title.className = 'config-title'
    title.textContent = config.title
    this.panel.appendChild(title)

    // Sections
    config.sections.forEach(section => {
      const sectionEl = document.createElement('div')
      sectionEl.className = 'config-section'

      const label = document.createElement('p')
      label.className = 'config-label'
      label.textContent = section.label
      sectionEl.appendChild(label)

      // Render correct widget per type
      switch (section.type) {
        case 'cycle':  sectionEl.appendChild(this.buildCycle(section));  break
        case 'toggle': sectionEl.appendChild(this.buildToggle(section)); break
        case 'color':  sectionEl.appendChild(this.buildColor(section));  break
      }

      this.panel.appendChild(sectionEl)
    })

    // Show panel + back button
    this.panel.classList.add('open')
    this.backBtn.style.display = 'block'
  }

  // ── Close ────────────────────────────────────────────────────────

  close() {
    this.orchestrator.environmentUI.resetUI()
    const envControls = document.getElementById('env-controls')
    if (envControls) envControls.style.display = 'flex'
    this.panel.classList.remove('open')
    this.backBtn.style.display = 'none'
    setTimeout(() => {
      this.panel.innerHTML = ''  // clear after transition
    }, 400)
  }

  // ── Widget builders ──────────────────────────────────────────────

  buildCycle(section) {
    const wrapper = document.createElement('div')
    wrapper.className = 'config-cycle'

    let index = 0

    const prev = document.createElement('button')
    prev.className = 'config-cycle-btn'
    prev.textContent = '‹'

    const label = document.createElement('span')
    label.className = 'config-cycle-label'
    label.textContent = section.options[index]

    const next = document.createElement('button')
    next.className = 'config-cycle-btn'
    next.textContent = '›'

    prev.addEventListener('click', () => {
      index = (index - 1 + section.options.length) % section.options.length
      label.textContent = section.options[index]
      section.onChange(index)
    })

    next.addEventListener('click', () => {
      index = (index + 1) % section.options.length
      label.textContent = section.options[index]
      section.onChange(index)
    })

    wrapper.appendChild(prev)
    wrapper.appendChild(label)
    wrapper.appendChild(next)
    return wrapper
  }

  buildToggle(section) {
    const wrapper = document.createElement('div')
    wrapper.className = 'config-toggle'

    let active = false

    const btn = document.createElement('button')
    btn.className = 'config-toggle-btn'
    btn.textContent = 'Off'

    btn.addEventListener('click', () => {
      active = !active
      btn.textContent = active ? 'On' : 'Off'
      btn.classList.toggle('active', active)
      section.onChange(active)
    })

    wrapper.appendChild(btn)
    return wrapper
  }

  buildColor(section) {
    const wrapper = document.createElement('div')
    wrapper.className = 'config-colors'

    let activeBtn = null

    section.options.forEach((color, i) => {
      const swatch = document.createElement('button')
      swatch.className = 'config-swatch'
      swatch.style.background = color
      swatch.setAttribute('aria-label', color)

      swatch.addEventListener('click', () => {
        if (activeBtn) activeBtn.classList.remove('active')
        swatch.classList.add('active')
        activeBtn = swatch
        section.onChange(i, color)
      })

      wrapper.appendChild(swatch)
    })

    return wrapper
  }
}