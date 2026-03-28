// src/data/data.js
import * as THREE from 'three/webgpu'

// ═══════════════════════════════════════════════════════════════════
// CAMERA
// ═══════════════════════════════════════════════════════════════════

export const CAMERA_CONFIG = {
  distance:      45,
  height:        15,
  fov:           40,
  defaultAngle:  Math.PI / -0.75,
  target:        new THREE.Vector3(0, 0, 0),
  swoopDuration: 2.0,
}

export const ORIGINAL_AZIMUTH = 2.09


// ═══════════════════════════════════════════════════════════════════
// ENVIRONMENT — time, weather, ocean
// ═══════════════════════════════════════════════════════════════════

export const TIME_PRESETS = {
  dawn: {
    sunColor:         0xffb347,
    sunIntensity:     1.0,
    sunPosition:      new THREE.Vector3(5, 5, 10),
    ambientColor:     0xffd0a0,
    ambientIntensity: 0.3,
    skyColor:         0xff7043,
    fogColor:         0xff7043,
    fogNear:          30,
    fogFar:           90,
  },
  day: {
    sunColor:         0xfff4e0,
    sunIntensity:     2,
    sunPosition:      new THREE.Vector3(10, 20, 10),
    ambientColor:     0xfff4e0,
    ambientIntensity: 0.5,
    skyColor:         0x87ceeb,
    fogColor:         0x87ceeb,
    fogNear:          40,
    fogFar:           100,
  },
  sunset: {
    sunColor:         0xff4500,
    sunIntensity:     1.5,
    sunPosition:      new THREE.Vector3(20, 4, 5),
    ambientColor:     0xff6030,
    ambientIntensity: 0.4,
    skyColor:         0xff6030,
    fogColor:         0xff6030,
    fogNear:          25,
    fogFar:           90,
  },
  night: {
    sunColor:         0x1a1a2e,
    sunIntensity:     -1,
    sunPosition:      new THREE.Vector3(-10, 10, -10),
    ambientColor:     0x0d0d2b,
    ambientIntensity: -1,
    skyColor:         0x7ea5c9,
    fogColor:         0x7ea5c9,
    fogNear:          25,
    fogFar:           75,
  },
}

export const WEATHER_PRESETS = {
  clear:    { ambientMultiplier: 1.0,  sunMultiplier: 1.0  },
  overcast: { ambientMultiplier: 1.4,  sunMultiplier: 0.3  },
  rain:     { ambientMultiplier: 1.2,  sunMultiplier: 0.1  },
  storm:    { ambientMultiplier: 0.8,  sunMultiplier: 0.05 },
}

export const OCEAN_PRESETS = {
  calm:   { waveAmplitude: 0.1, waveFrequency: 0.5, waveSpeed: 0.3 },
  choppy: { waveAmplitude: 0.4, waveFrequency: 1.2, waveSpeed: 0.8 },
  rough:  { waveAmplitude: 0.9, waveFrequency: 2.0, waveSpeed: 1.5 },
}


// ═══════════════════════════════════════════════════════════════════
// BIKE CONFIGURATOR
// ═══════════════════════════════════════════════════════════════════

export const BIKE_CAMERA_CONFIG = {
  cameraPosition: new THREE.Vector3(0, 0, -10),
  cameraTarget:   new THREE.Vector3(0, 1, 0),
  swoopDuration:  2.0,
  dampingFactor:  0.02,
}

export const BIKE_FOG_CONFIG = {
  fogNear: 10,
  fogFar:  30,
}

export const BIKE_PARTS = {
  headlight: {
    variants: [
      { name: 'Round',  path: '/models/clickable/bike/parts/headlight_round.glb'  },
      { name: 'Square', path: '/models/clickable/bike/parts/headlight_square.glb' },
      { name: 'Pill',   path: '/models/clickable/bike/parts/headlight_pill.glb'   },
    ]
  },
  wheels: {
    variants: [
      { name: 'Spokes',    path: '/models/clickable/bike/parts/wheels_spokes.glb'   },
      { name: 'Fan Blade', path: '/models/clickable/bike/parts/wheels_fanblade.glb' },
    ]
  },
  mirrors:{
    variants: [
        { name: 'Top',    path: '/models/clickable/bike/parts/mirrors_top.glb'   },
        { name: 'Hang', path: '/models/clickable/bike/parts/mirrors_hang.glb' }, 
    ]
  },
  seat: {
    variants: [
      { name: 'Single',    path: '/models/clickable/bike/parts/seat_single.glb'    },
      { name: 'Passenger', path: '/models/clickable/bike/parts/seat_passenger.glb' },
    ]
  },
  exhaust:    { toggle: true, path: '/models/clickable/bike/parts/exhaust.glb'    },
  saddlebag:  { toggle: true, path: '/models/clickable/bike/parts/saddlebag.glb'  },
  windshield: { toggle: true, path: '/models/clickable/bike/parts/windshield.glb' },
}

export const BIKE_UI_CONFIG = {
  title: 'Bike',
  sections: [
    { label: 'Headlight', type: 'cycle',  options: ['Round', 'Square', 'Pill'],              onChange: null },
    { label: 'Wheels',    type: 'cycle',  options: ['Spokes', 'Fan Blade'],                  onChange: null },
    { label: 'Mirrors',   type: 'cycle',  options: ['Top', 'Hang'],                          onChange: null },
    { label: 'Seat',      type: 'cycle',  options: ['Single', 'Passenger'],                  onChange: null },
    { label: 'Exhaust',   type: 'toggle',                                                    onChange: null },
    { label: 'Saddlebag', type: 'toggle',                                                    onChange: null },
    { label: 'Windshield',type: 'toggle',                                                    onChange: null },
    { label: 'Color',     type: 'color',  options: ['#222222', '#cc0000', '#0044cc', '#22aa44'], onChange: null },
  ]
}


// ═══════════════════════════════════════════════════════════════════
// TRUCK CONFIGURATOR — coming soon
// ═══════════════════════════════════════════════════════════════════

// export const TRUCK_CAMERA_CONFIG = { ... }
// export const TRUCK_PARTS = { ... }
// export const TRUCK_UI_CONFIG = { ... }


// ═══════════════════════════════════════════════════════════════════
// BOAT CONFIGURATOR — coming soon
// ═══════════════════════════════════════════════════════════════════

// export const BOAT_CAMERA_CONFIG = { ... }
// export const BOAT_PARTS = { ... }
// export const BOAT_UI_CONFIG = { ... }