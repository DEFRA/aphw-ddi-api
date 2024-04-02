const { getComments, removeComment } = require('../../../repos/comments')

const processComment = async (comment) => {
  await removeComment(comment.id)
}

/**
 * @param {number} maxRecords
 * @returns {Promise<{rowsProcessed: number, rowsInError: number}>}
 */
const processComments = async (maxRecords) => {
  const comments = await getComments(maxRecords)
  let rowsInError = 0

  for (const comment of comments) {
    try {
      await processComment(comment)
    } catch (error) {
      console.error(`Error processing comment - ${error}`)
      rowsInError++
    }
  }

  return {
    rowsProcessed: comments.length,
    rowsInError,
    rowsPublishedToEvents: 0
  }
}

module.exports = {
  processComments
}
