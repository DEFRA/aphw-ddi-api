const { deleteDogByIndexNumber } = require('./dog')

const deleteDogs = async (dogsToDelete, user) => {
  const result = {
    count: {
      failed: 0,
      success: 0
    },
    deleted: {
      failed: [],
      success: []
    }
  }

  for (const dogToDelete of dogsToDelete) {
    try {
      await deleteDogByIndexNumber(dogToDelete, user)
      result.count.success++
      result.deleted.success.push(dogToDelete)
    } catch (e) {
      console.error('Failed to Delete dogToDelete', e)
      result.count.failed++
      result.deleted.failed.push(dogToDelete)
    }
  }

  return result
}

module.exports = {
  deleteDogs
}
