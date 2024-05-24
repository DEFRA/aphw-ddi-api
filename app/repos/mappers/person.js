const { getLatestAddress } = require('../sort/address')
/**
 * @param {PersonDao} personDao
 * @returns {CreatedPersonDao}
 */
const mapPersonDaoToCreatedPersonDao = (personDao) => {
  const [latestAddress] = personDao.addresses
  const personDaoAddress = latestAddress.address

  return {
    id: personDao.id,
    first_name: personDao.first_name,
    last_name: personDao.last_name,
    birth_date: personDao.birth_date,
    person_reference: personDao.person_reference,
    address: {
      address_line_1: personDaoAddress.address_line_1,
      address_line_2: personDaoAddress.address_line_2,
      country: {
        id: personDaoAddress.country.id,
        country: personDaoAddress.country.country
      },
      country_id: personDaoAddress.country_id,
      county: personDaoAddress.county,
      id: personDaoAddress.id,
      postcode: personDaoAddress.postcode,
      town: personDaoAddress.town
    },
    organisation_name: personDao.organisation?.organisation_name
  }
}

/**
 * @param {PersonDao} personDao
 * @return {PersonDao}
 */
const mapPersonDaoToPersonDaoWithLatestAddress = (personDao) => {
  if (personDao.addresses) {
    personDao.addresses = getLatestAddress(personDao.addresses)
  }

  return personDao
}

module.exports = {
  mapPersonDaoToPersonDaoWithLatestAddress,
  mapPersonDaoToCreatedPersonDao
}
