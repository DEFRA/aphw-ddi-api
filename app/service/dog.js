const { sendUpdateToAudit } = require('../messaging/send-audit')
const { DOG } = require('../constants/event/audit-event-object-types')
const { statuses } = require('../constants/statuses')
const { mapDogDaoToDog } = require('../repos/mappers/cdo')

class DogService {
  constructor (dogRepository, breachesRepository) {
    this._dogRepository = dogRepository
    this._breachesRepository = breachesRepository
  }

  /**
   *
   * @param {Dog} dog
   * @param {string[]} dogBreaches
   * @param {BreachCategory[]} allDogBreaches
   * @param user
   * @private
   */
  _prepareBreaches (dog, dogBreaches, allDogBreaches, user) {
    // Force audit record to show all breach reasons, even if only one new reason added
    console.log('dog', dog)
    const preAuditDog = {
      index_number: dog.indexNumber,
      status: dog.status === statuses.InBreach ? '' : dog.status,
      dog_breaches: []
    }

    const callback = async () => {
      const postAuditDog = {
        index_number: dog.indexNumber,
        status: statuses.InBreach,
        dog_breaches: dog.breaches.map((breach) => breach.label)
      }
      await sendUpdateToAudit(DOG, preAuditDog, postAuditDog, user)
    }

    dog.setBreaches(dogBreaches, allDogBreaches, callback)

    return dog
  }

  async setBreaches (dogIndex, dogBreaches, user, transaction) {
    /**
     * @type {import('../data/domain/dog')}
     */
    const dog = await this._dogRepository.getDogModel(dogIndex)
    const allDogBreaches = await this._breachesRepository.getBreachCategories()

    const changedDog = this._prepareBreaches(dog, dogBreaches, allDogBreaches, user)

    await this._dogRepository.saveDog(changedDog, transaction)

    return this._dogRepository.getDogModel(dogIndex, transaction)
  }

  async setBreach (dogDao, breachCategory, user, transaction) {
    /**
     * @type {import('../data/domain/dog')}
     */
    const dog = mapDogDaoToDog(dogDao)
    const allDogBreaches = await this._breachesRepository.getBreachCategories()

    const changedDog = this._prepareBreaches(dog, [breachCategory], allDogBreaches, user)

    await this._dogRepository.saveDogFields(changedDog, dogDao, transaction)

    return changedDog
  }
}

module.exports = { DogService }
