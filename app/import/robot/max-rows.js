const checkMaxRows = passed => {
  let dogCount = 0
  passed.add.forEach(x => {
    dogCount += x.dogs.length
  })

  if (dogCount > 30) {
    passed.errors.push('A single import cannot have more than 30 dogs')
  }
}

module.exports = {
  checkMaxRows
}
