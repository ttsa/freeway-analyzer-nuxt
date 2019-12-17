const types = {
  31: '小客車',
  32: '小貨車',
  41: '大客車',
  42: '大貨車',
  5: '聯結車'
}

module.exports = function (id) {
  const name = types[id]
  if (name) {
    return name
  } else {
    return `未知 (${id})`
  }
}
