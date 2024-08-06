const mapDogBreed = (dogBreedDao) => (
  {
    id: dogBreedDao.id,
    breed: dogBreedDao.breed,
    display_order: dogBreedDao.display_order
  }
)

module.exports = {
  mapDogBreed
}
