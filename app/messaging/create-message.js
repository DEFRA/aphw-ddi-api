const createMessage = (event) => {
  const { type, source, id, partitionKey = undefined, subject = undefined, data = undefined } = event
  return {
    body: {
      specversion: '1.0',
      type,
      source,
      id,
      partitionKey,
      time: new Date().toISOString(),
      subject,
      datacontenttype: 'text/json',
      data
    },
    type,
    source
  }
}

module.exports = {
  createMessage
}
