/**
 * @param {PersonDao} personDao
 * @returns {CreatedPersonDao}
 */
const mapPersonDaoToCreatedPersonDao = (personDao) => {
  const [personDaoAddressParent] = personDao.addresses
  const personDaoAddress = personDaoAddressParent.address

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
    }
  }
}

module.exports = {
  mapPersonDaoToCreatedPersonDao
}
