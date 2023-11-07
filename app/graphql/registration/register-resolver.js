const { getDogById } = require('../../dog/get-dog')

module.exports = async (parent, args, context, info) => {
  const indexNumber = args.indexNumber
  console.log('indexNumber', indexNumber)
  const dog = await getDogById(indexNumber)

  return dog
}
