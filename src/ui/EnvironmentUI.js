export class EnvironmentUI {
  constructor(environment) {
    this.environment = environment

this.states = {
  time: { index: 1, cycles: [
    { value: 'dawn',   icon: '/src/assets/icons/time/dawn.svg',     tooltip: 'Dawn'     },
    { value: 'day',    icon: '/src/assets/icons/time/day.svg',      tooltip: 'Day'      },
    { value: 'sunset', icon: '/src/assets/icons/time/sunset.svg',   tooltip: 'Sunset'   },
    { value: 'night',  icon: '/src/assets/icons/time/night.svg',    tooltip: 'Night'    },
  ]},
  weather: { index: 0, cycles: [
    { value: 'clear',    icon: '/src/assets/icons/weather/clear.svg',    tooltip: 'Clear'    },
    { value: 'overcast', icon: '/src/assets/icons/weather/overcast.svg', tooltip: 'Overcast' },
    { value: 'rain',     icon: '/src/assets/icons/weather/rain.svg',     tooltip: 'Rain'     },
    { value: 'storm',    icon: '/src/assets/icons/weather/storm.svg',    tooltip: 'Storm'    },
  ]},
  ocean: { index: 0, cycles: [
    { value: 'calm',   icon: '/src/assets/icons/ocean/calm.svg',   tooltip: 'Calm'   },
    { value: 'choppy', icon: '/src/assets/icons/ocean/choppy.svg', tooltip: 'Choppy' },
    { value: 'rough',  icon: '/src/assets/icons/ocean/rough.svg',  tooltip: 'Rough'  },
  ]},
}

    this._buildUI()
  }

  // ── Build DOM ────────────────────────────────────────────────────

  _buildUI() {
    // Import shared styles
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/src/styles/ui.css'
    document.head.appendChild(link)


    // Container
    const container = document.createElement('div')
    container.id = 'env-controls'
    document.body.appendChild(container)

    // One button per system
    this.buttons = {}

    Object.entries(this.states).forEach(([key, state]) => {
      const current = state.cycles[state.index]

      const btn = document.createElement('button')
      btn.classList.add('env-btn')
      const img = document.createElement('img')
        img.src = current.icon
        img.alt = current.tooltip
        img.classList.add('env-icon')
        btn.appendChild(img)
      btn.setAttribute('data-tooltip', current.tooltip)
      btn.setAttribute('aria-label', current.tooltip)

      btn.addEventListener('click', () => this._onCycle(key))

      // Touch — prevent double fire on mobile
      btn.addEventListener('touchend', (e) => {
        e.preventDefault()
        this._onCycle(key)
      })

      container.appendChild(btn)
      this.buttons[key] = btn
    })
  }

  // ── Cycle Logic ──────────────────────────────────────────────────

  _onCycle(key) {
    const state = this.states[key]
    const btn = this.buttons[key]

    // Prevent spam clicking during transition
    if (btn.classList.contains('transitioning')) return
    btn.classList.add('transitioning')

    // Advance index
    state.index = (state.index + 1) % state.cycles.length
    const next = state.cycles[state.index]

    // Animate icon swap
    btn.style.transform = 'scale(0.7)'
    btn.style.opacity = '0.5'

    setTimeout(() => {
        const img = btn.querySelector('.env-icon')
        img.src = next.icon
        img.alt = next.tooltip
      btn.setAttribute('data-tooltip', next.tooltip)
      btn.setAttribute('aria-label', next.tooltip)
      btn.style.transform = ''
      btn.style.opacity = ''

      setTimeout(() => {
        btn.classList.remove('transitioning')
      }, 200)
    }, 150)

    // Tell environment system to change
    switch (key) {
      case 'time':    this.environment.setTime(next.value);    break
      case 'weather': this.environment.setWeather(next.value); break
      case 'ocean':   this.environment.setOcean(next.value);   break
    }
  }
}