const log = (buffer, textLine) => {
  console.log(textLine)
  buffer.push(textLine)
}

module.exports = {
  log
}
