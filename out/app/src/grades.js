// Midnight Vice grades: re-toning filters for cover art panels
// 6 grades: Midnight default, Neon Rain, Sunset, Noir, Vice Gold, Mono Chrome

export const GRADES = {
  Midnight: {
    name: 'Midnight',
    css: 'filter: hue-rotate(200deg) contrast(1.15) brightness(0.95);',
    description: 'Deep indigo/neon-noir base tone'
  },
  'Neon Rain': {
    name: 'Neon Rain',
    css: 'filter: hue-rotate(180deg) saturate(1.4) brightness(1.1) contrast(1.15);',
    description: 'Amplified neon teal-purple rain'
  },
  Sunset: {
    name: 'Sunset',
    css: 'filter: hue-rotate(30deg) saturate(1.3) brightness(1.05) contrast(1.1);',
    description: 'Warm orange-purple afterglow'
  },
  Noir: {
    name: 'Noir',
    css: 'filter: contrast(1.3) brightness(0.9) sepia(0.3) saturate(0.6);',
    description: 'High-contrast black-and-white noir'
  },
  'Vice Gold': {
    name: 'Vice Gold',
    css: 'filter: hue-rotate(45deg) saturate(1.2) brightness(1.05) contrast(1.15) sepia(0.15);',
    description: 'Gold-tinted vice metropolis'
  },
  'Mono Chrome': {
    name: 'Mono Chrome',
    css: 'filter: grayscale(1) sepia(0.2) contrast(1.2) brightness(1.05);',
    description: 'Classic monochrome with sepia warmth'
  }
}

export function applyGrade(gradeName, ctx, width, height) {
  const grade = GRADES[gradeName]
  if (!grade) return
  const imgData = ctx.getImageData(0, 0, width, height)
  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = imgData.data[i]
    const g = imgData.data[i + 1]
    const b = imgData.data[i + 2]
    const a = imgData.data[i + 3]
    if (a === 0) continue
    let R, G, B
    if (gradeName === 'Midnight') {
      R = Math.min(255, r + 20)
      G = Math.min(255, g - 30)
      B = Math.min(255, b + 50)
    } else if (gradeName === 'Neon Rain') {
      R = Math.min(255, r + 50)
      G = Math.min(255, g - 20)
      B = Math.min(255, b + 80)
    } else if (gradeName === 'Sunset') {
      R = Math.min(255, r + 60)
      G = Math.min(255, g - 20)
      B = Math.max(0, b - 30)
    } else if (gradeName === 'Noir') {
      const gray = (r * 0.299 + g * 0.587 + b * 0.114) / 255
      R = Math.min(255, r * 1.3)
      G = Math.min(255, g * 1.3)
      B = Math.min(255, b * 1.3)
    } else if (gradeName === 'Vice Gold') {
      R = Math.min(255, r + 40)
      G = Math.min(255, g + 30)
      B = Math.min(255, b - 10)
    } else if (gradeName === 'Mono Chrome') {
      const gray = (r * 0.299 + g * 0.587 + b * 0.114) / 255
      R = Math.min(255, gray * 1.2)
      G = Math.min(255, gray * 1.2)
      B = Math.min(255, gray * 1.2)
    }
    imgData.data[i] = R
    imgData.data[i + 1] = G
    imgData.data[i + 2] = B
    imgData.data[i + 3] = a
  }
  ctx.putImageData(imgData, 0, 0)
}