const path = require('path')
const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./server/db.json')
const lowdb = low(adapter)
const config = require('../nuxt.config.js')
// Import and Set Nuxt.js options
config.dev = process.env.NODE_ENV !== 'production'

const utilPath = path.join(__dirname, '/../utils/')
// const getGentry = require('./gentries')
const getVehicleType = require(path.join(utilPath, 'lib/vehicleTypes'))
const getAvaiableSections = require(path.join(utilPath, 'getAvaiableSections'))
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

  app.get('/sections/:startId/:endId/:timestamp', (req, res, next) => {
    const q = {
      s: req.params.startId,
      e: req.params.endId,
      t: req.params.timestamp
    }
    console.log(q)
    const data = lowdb.get('freeflows').find(q).value()
    // console.log(data)
    const result = {
      byVtype: {},
      maxSpeed: 0
    }
    if (data) {
      result.maxSpeed = data.m
      Object.keys(data.d).forEach((vType) => {
        // console.log(vType)
        const _vType = getVehicleType(vType)
        // console.log('_vType', _vType)
        // console.log('vType', vType)
        result.byVtype[_vType] = data.d[vType.toString()]
      })
    }
    res.json(result)
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
