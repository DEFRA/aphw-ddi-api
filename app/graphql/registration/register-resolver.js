const { getDogByIndexNumber } = require('../../../app/repos/dogs')

module.exports = async (parent, args, context, info) => {
  const indexNumber = args.indexNumber
  console.log('indexNumber', indexNumber)
  const dog = await getDogByIndexNumber(indexNumber)

  return dog
}
