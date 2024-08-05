const mapPoliceForceDaoToDto = (policeForce) => ({
  id: policeForce.id,
  name: policeForce.name
})

module.exports = {
  mapPoliceForceDaoToDto
}
