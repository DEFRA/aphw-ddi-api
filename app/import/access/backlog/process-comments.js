const { getComments, removeComment } = require('../../../repos/comments')
const { sendCommentEvent } = require('./send-comment-event')

const processComment = async (comment) => {
  await sendCommentEvent(comment)
  await removeComment(comment.id)
}

/**
 * @param {number} maxRecords
 * @returns {Promise<{rowsProcessed: number, rowsInError: number}>}
 */
const processComments = async (maxRecords) => {
  const comments = await getComments(maxRecords)

  let rowsInError = 0
  let rowsPublishedToEvents = 0

  for (const comment of comments) {
    try {
      await processComment(comment)
      rowsPublishedToEvents++
    } catch (error) {
      console.error(`Error processing comment - ${error}`)
      rowsInError++
    }
  }

  return {
    rowsProcessed: comments.length,
    rowsInError,
    rowsPublishedToEvents
  }
}

module.exports = {
  processComments
}
