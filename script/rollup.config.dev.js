import baseConfig from './rollup.config.base.js'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    serve({
      port: 8080,
      contentBase: ['dist', 'example/browser'],
      openPage: 'index.html',
    }),
    livereload({
      watch: 'example/browser',
    })
  ]
}
