/**
 * Definition of strobe profiles.
 * Contains GN (Guide Number) and other specs.
 */

export const STROBE_PROFILES = {
  'TT350S': {
    name: 'Godox TT350S',
    gn: 36, // at ISO 100, 105mm
    minPowerStr: '1/128',
    maxPowerStr: '1/1',
    steps: [
      // 1/128 to 1/1 in 1/3 stops
      { ratio: 1/128, label: '1/128' },
      { ratio: 1/128 * Math.pow(2, 1/3), label: '1/128 +0.3' },
      { ratio: 1/128 * Math.pow(2, 2/3), label: '1/128 +0.7' },
      { ratio: 1/64, label: '1/64' },
      { ratio: 1/64 * Math.pow(2, 1/3), label: '1/64 +0.3' },
      { ratio: 1/64 * Math.pow(2, 2/3), label: '1/64 +0.7' },
      { ratio: 1/32, label: '1/32' },
      { ratio: 1/32 * Math.pow(2, 1/3), label: '1/32 +0.3' },
      { ratio: 1/32 * Math.pow(2, 2/3), label: '1/32 +0.7' },
      { ratio: 1/16, label: '1/16' },
      { ratio: 1/16 * Math.pow(2, 1/3), label: '1/16 +0.3' },
      { ratio: 1/16 * Math.pow(2, 2/3), label: '1/16 +0.7' },
      { ratio: 1/8, label: '1/8' },
      { ratio: 1/8 * Math.pow(2, 1/3), label: '1/8 +0.3' },
      { ratio: 1/8 * Math.pow(2, 2/3), label: '1/8 +0.7' },
      { ratio: 1/4, label: '1/4' },
      { ratio: 1/4 * Math.pow(2, 1/3), label: '1/4 +0.3' },
      { ratio: 1/4 * Math.pow(2, 2/3), label: '1/4 +0.7' },
      { ratio: 1/2, label: '1/2' },
      { ratio: 1/2 * Math.pow(2, 1/3), label: '1/2 +0.3' },
      { ratio: 1/2 * Math.pow(2, 2/3), label: '1/2 +0.7' },
      { ratio: 1/1, label: '1/1' }
    ]
  }
};
