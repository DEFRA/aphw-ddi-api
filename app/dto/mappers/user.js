/**
 * @param {UserAccount} userAccountDao
 * @return {UserAccountDto}
 */
const mapUserDaoToDto = (userAccountDao) => {
  return {
    id: userAccountDao.id,
    police_force_id: userAccountDao.police_force_id ?? undefined,
    username: userAccountDao.username,
    active: userAccountDao.active
  }
}

module.exports = {
  mapUserDaoToDto
}
