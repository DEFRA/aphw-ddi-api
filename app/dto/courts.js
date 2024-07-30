const mapCourtToDto = (court) => ({
  id: court.id,
  name: court.name
})

module.exports = {
  mapCourtToDto
}
