const path = require('path')
const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./server/db.json')
const lowdb = low(adapter)

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

const utilPath = path.join(__dirname, '/../utils/')
// const getGentry = require('./gentries')
const getAvaiableSections = require(utilPath + 'getAvaiableSections')
async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  app.get('/sections', (req, res, next) => {
    // const gentries = getGentry('all')
    // const list = Object.keys(gentries).map((k) => {
    //   return {
    //     gentryId: k,
    //     ...gentries[k]
    //   }
    // })
    const list = getAvaiableSections()
    res.json(list)
  })

  app.get('/sections/:startId', (req, res, next) => {
    const data = lowdb.get('freeflows').find({
      startGentryId: req.params.startId
    }).value()
    res.json(data)
  })

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
