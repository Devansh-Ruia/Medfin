// This script exists because manually exporting 8 PNGs from Figma is a tax on developer sanity
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const inputSvg = path.join(__dirname, '../public/icons/icon-source.svg')
const outputDir = path.join(__dirname, '../public/icons')

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

sizes.forEach(size => {
  sharp(inputSvg)
    .resize(size, size)
    .png()
    .toFile(path.join(outputDir, `icon-${size}.png`))
    .then(() => console.log(`Generated ${size}x${size}`))
    .catch(err => console.error(`Failed at ${size}px:`, err))
})
