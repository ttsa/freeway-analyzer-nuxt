const gentries = require('./_gentries')
module.exports = function (id) {
  const gentry = gentries[id]

  if (id === 'all') {
    return gentries
  }
  if (typeof gentry === 'object') {
    return gentry
  } else {
    return {
      id,
      sectionStart: ''
    }
  }
}
