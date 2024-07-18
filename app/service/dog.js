const { sendUpdateToAudit } = require('../messaging/send-audit')
const { DOG } = require('../constants/event/audit-event-object-types')

class DogService {
  constructor (dogRepository, breachesRepository) {
    this._dogRepository = dogRepository
    this._breachesRepository = breachesRepository
  }

  async setBreaches (dogIndex, dogBreaches, user) {
    /**
     * @type {import('../data/domain/dog')}
     */
    const dog = await this._dogRepository.getDogModel(dogIndex)
    const allDogBreaches = await this._breachesRepository.getBreachCategories()

    /**
     * @param {BreachCategory} breach
     * @return {string}
     */
    const mapBreach = (breach) => breach.label

    const preAuditDog = {
      index_number: dogIndex,
      status: dog.status,
      dog_breaches: dog.breaches.map(mapBreach)
    }

    const callback = async () => {
      const postAuditDog = {
        index_number: dogIndex,
        status: 'In breach',
        dog_breaches: dog.breaches.map(mapBreach)
      }
      await sendUpdateToAudit(DOG, preAuditDog, postAuditDog, user)
    }

    dog.setBreaches(dogBreaches, allDogBreaches, callback)
    await this._dogRepository.saveDog(dog)

    return this._dogRepository.getDogModel(dogIndex)
  }
}

module.exports = { DogService }
