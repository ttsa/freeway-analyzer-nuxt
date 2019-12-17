const moment = require('moment')
const getVehicleType = require('./vehicleTypes')
const getGentry = require('./gentries')

function calculateSpeed (d1, d2, length) {
  d1 = moment(d1)
  d2 = moment(d2)
  // let duration = (d2 - d1) / 1000
  const duration = moment.duration(d2 - d1)
  let speed = (length / duration.asHours())
  speed = Math.round(Math.abs(speed))

  // if(isNaN(speed)){
  //   console.log('duration', duration.asHours())
  //   console.log('length', length)
  //   console.log(d1.format())
  //   console.log(d2.format())
  //   process.exit()
  // }
  return speed
}

function handleRow (index, row) {
  let i = 0
  const details = row.tripDetails
  // let vehicleId =
  //   row['vehicleType'] +
  //   row['enterTime'] +
  //   row['enterGentry'] +
  //   row['exitTime'] +
  //   row['exitGentry']

  const tripStartDateTime = row.enterTime
  const result = []

  // console.log('row', details)
  do {
    try {
      // console.log('--')
      // console.log(details[i])
      const nextIndex = (details.length > 1) ? i + 1 : 0
      const [startDateTime, startGentryId] = details[i].trim().split('+')
      const [endDateTime, endGentryId] = details[nextIndex].trim().split('+')
      const vehicleType = getVehicleType(row.vehicleType)
      const startGentry = getGentry(startGentryId)
      const endGentry = getGentry(endGentryId)
      let tripLength = 0
      let speed = 0

      // prevent duplicate records
      const key =
              i.toString() + index.toString() +
              row.vehicleType +
              startGentryId +
              endGentryId +
              startDateTime +
              endDateTime

      // console.log('gentry', startGentryId, startGentry.locationMile, endGentry.locationMile)
      // console.log('typeof startGentry', typeof startGentry)
      // // console.log(startGentry)
      if (typeof startGentry === 'object' &&
          typeof endGentry === 'object' &&
          startGentryId !== endGentryId) {
        if (startGentry.roadName !== endGentry.roadName) {
          tripLength = NaN
          // speed = 0
        } else {
          tripLength = Math.abs(
            getGentry(endGentryId).locationMile -
              getGentry(startGentryId).locationMile
          ).toFixed(1)

          tripLength = parseFloat(tripLength)
        }
        if (!isNaN(tripLength)) {
          speed = calculateSpeed(startDateTime, endDateTime, tripLength)
        }
      }

      // console.log('tripLength', tripLength)
      // console.log('speed', speed)
      const rowToInsert = {
        // vehicleId,
        key,
        tripStartDateTime,
        vehicleType,
        startDateTime,
        endDateTime,
        startGentryId,
        endGentryId,
        startGentry,
        endGentry,
        tripLength,
        speed
      }

      result.push(rowToInsert)
      i++
    } catch (error) {
      console.log(error)
    }
  } while (i < details.length - 1)
  return result
}

module.exports = handleRow
