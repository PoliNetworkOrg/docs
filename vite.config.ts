import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fumadocsMdx } from 'fumadocs-mdx/vite'

export default defineConfig({
  base: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/` : '/',
  plugins: [fumadocsMdx(), tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
})
