
module.exports = {
  mode: 'spa',
  env: {
    GMAP_KEY: process.env.GMAP_KEY
  },
  /*
  ** Headers of the page
  */
  head: {
    script: [
      // { src: 'https://cdn.bootcss.com/element-ui/2.12.0/index.js' }
      // { src: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.min.js' },
      // { src: 'https://unpkg.com/vue-chartjs/dist/vue-chartjs.min.js' }
      // { src: `https://maps.googleapis.com/maps/api/js?key=${process.env.GMAP_KEY}` }
    ],
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://cdn.bootcss.com/element-ui/2.12.0/theme-chalk/index.css' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    // 'element-ui/lib/theme-chalk/index.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/element-ui'
    // 'element-ui'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  devModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    ['nuxt-gmaps', {
      key: process.env.GMAP_KEY
      // you can use libraries: ['places']
    }]

  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
  },
  /*
  ** Build configuration
  */
  build: {
    transpile: [/^element-ui/],
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
