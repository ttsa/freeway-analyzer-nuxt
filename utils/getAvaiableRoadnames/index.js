const getGentry = require('../../server/gentries')

const gentries = getGentry('all')

const roadNames = []
Object.keys(gentries).forEach((k) => {
  if (!roadNames.includes(gentries[k].roadName)) {
    roadNames.push(gentries[k].roadName)
  }
})

console.log(roadNames)
