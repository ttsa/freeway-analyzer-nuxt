const exec = require('child_process').exec
const moment = require('moment')
const cliProgress = require('cli-progress')
const parseCSV = require('../lib/parseCSV')
const handleRawRow = require('../lib/handleRawRow')

module.exports = function (file) {
  return new Promise((resolve, reject) => {
    const speedByGentrys = {}
    const startTime = moment()
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    let totalLines = -1
    exec(`wc -l ${file}`, function (error, results) {
      if (error) {
        console.error(error)
      }
      totalLines = results.trim().split(' ')[0]
      bar1.start(totalLines, 0)
    })

    parseCSV(file, (index, row) => {
      bar1.update(index)
      const result = handleRawRow(index, row)
      result.forEach((r) => {
        const dateTimeKey = moment(r.startDateTime).startOf('hour').format('YYYY-MM-DD HH:SS')
        const key = `${r.startGentryId},${r.endGentryId},${dateTimeKey}`
        if (!speedByGentrys[key]) {
          speedByGentrys[key] = {}
        }

        const vType = r.vehicleType
        if (!speedByGentrys[key][vType]) {
          speedByGentrys[key][vType] = {
            speeds: {},
            validCount: 0,
            invalidCount: 0,
            _85th: ''
          }
        }
        const speed = r.speed

        if (!speedByGentrys[key][vType].speeds[speed]) {
          speedByGentrys[key][vType].speeds[speed] = 0
        }

        if (speed === 0) {
          speedByGentrys[key][vType].invalidCount++
        } else {
          speedByGentrys[key][vType].validCount++
        }

        speedByGentrys[key][vType].speeds[speed] = speedByGentrys[key][vType].speeds[speed] + 1
      })
    })
      .then((rowCount) => {
        bar1.stop()
        const endTime = moment()
        const duration = moment.duration(endTime - startTime)
        console.log(rowCount, 'processed took', duration.asSeconds())

        // console.log(speedByGentrys)
        resolve(speedByGentrys)
      })
  })
}
