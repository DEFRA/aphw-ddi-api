const { differenceInCalendarMonths } = require('date-fns')
const { sendUpdateToAudit } = require('../messaging/send-audit')
const { DOG } = require('../constants/event/audit-event-object-types')
const { statuses } = require('../constants/statuses')
const { mapDogDaoToDog } = require('../repos/mappers/cdo')
const { NotFoundError } = require('../errors/not-found')
const { EXEMPTION } = require('../constants/event/audit-event-object-types')

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

  canDogBeWithdrawn (dog) {
    const now = new Date()
    const dob = dog.birth_date ? new Date(dog.birth_date) : now
    return dog.registration.exemption_order.exemption_order === '2023' && differenceInCalendarMonths(now, dob) > 18
  }

  async withdrawDog (indexNumber, user) {
    const dog = await this._dogRepository.getDogByIndexNumber(indexNumber)

    if (!dog) {
      throw new NotFoundError(`Dog ${indexNumber} not found`)
    }

    if (!this.canDogBeWithdrawn(dog)) {
      throw new Error(`Dog ${indexNumber} is not valid for withdrawal`)
    }

    const preAudit = { index_number: indexNumber, status: dog.status.status, withdrawn: dog.registration.withdrawn }

    const shouldChangeStatus = dog.status.status !== statuses.Withdrawn

    const shouldSetDate = !dog.registration.withdrawn

    if (shouldChangeStatus) {
      const statusList = await this._dogRepository.getCachedStatuses()
      dog.status_id = statusList.filter(x => x.status === statuses.Withdrawn)[0].id
    }

    if (shouldSetDate) {
      dog.registration.withdrawn = new Date()
    }

    if (shouldChangeStatus) {
      await dog.save()
    }

    if (shouldSetDate) {
      await dog.registration.save()
    }

    if (shouldChangeStatus || shouldSetDate) {
      const postAudit = { index_number: indexNumber, status: statuses.Withdrawn, withdrawn: dog.registration.withdrawn }
      await sendUpdateToAudit(EXEMPTION, preAudit, postAudit, user)
    }
  }
}

module.exports = { DogService }
