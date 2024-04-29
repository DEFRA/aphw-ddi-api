const checkMaxRows = passed => {
  let dogCount = 0
  passed.add.forEach(x => {
    dogCount += x.dogs.length
  })

  if (dogCount > 100) {
    passed.errors.push('A single import cannot have more than 100 dogs')
  }
}

module.exports = {
  checkMaxRows
}
