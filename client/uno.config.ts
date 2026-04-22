import {
    defineConfig,
    presetAttributify,
    presetWind3,
    transformerVariantGroup,
  } from 'unocss'
  import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'
  
  export default defineConfig({
    presets: [
      presetWind3(),
      presetAttributify(),
    ],
    transformers: [
      transformerVariantGroup(),
      transformerAttributifyJsx(),
    ],
  })