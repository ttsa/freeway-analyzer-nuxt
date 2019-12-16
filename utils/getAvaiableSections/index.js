const getGentry = require('../../server/gentries')

const gentries = getGentry('all')

module.exports = function () {
  const roadNames = []
  const ordered = {}
  Object.keys(gentries).forEach((k) => {
    const g = gentries[k]
    if (!roadNames.includes(g.roadName)) {
      roadNames.push(g.roadName)
    }
    const key = g.roadName + ',' + g.direction

    if (!Array.isArray(ordered[key])) {
      ordered[key] = []
    }
    g.gentryId = k
    ordered[key].push(g)
  })

  Object.keys(ordered).forEach((k) => {
    const direction = k.split(',')[1]
    // process.exit()
    ordered[k].sort((a, b) => {
      if (direction === 'S') {
        return a.locationMile - b.locationMile
      } else {
        return b.locationMile - a.locationMile
      }
    })
  })

  const avaiableSections = []
  Object.keys(ordered).forEach((k) => {
    const o = ordered[k]

    o.forEach((c, index) => {
      const n = o[index + 1]
      if (typeof n === 'undefined') {
        return
      }
      // console.log(c.direction, c.sectionStart, n.sectionStart)

      // avaiableSections.push(`${c.gentryId}, ${n.gentryId}`)
      const r = {
        direction: c.direction,
        startGentry: c.gentryId,
        startMile: c.locationMile,
        startPositon: c.PositionLat + ',' + c.PositionLon,
        endGentry: n.gentryId,
        // endMile: n.locationMile,
        endPositon: n.PositionLat + ',' + n.PositionLon,
        roadName: c.roadName,
        mile: `${c.locationMileRaw} -> ${n.locationMileRaw}`,
        name: `${c.sectionStart} -> ${n.sectionStart}`
      }
      // console.log(r.d, r.startGentry, r.endGentry, r.name, r.startMile, r.endMile)
      // const url = `https://www.google.com/maps/dir/${r.startPositon}/${r.endPositon}`
      // console.log(url)
      // console.log('--')

      avaiableSections.push(r)
    })
  })

  return avaiableSections
}
// console.log(avaiableSections.length)

// https://www.google.com/maps/dir/24.984095,121.23253/24.96525,121.20987
// console.log(q)
