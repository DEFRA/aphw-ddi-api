/**
 * @param {null|Date} date
 * @param [defaultReturn]
 * @return {string|false}
 */
const isoDateOrDefault = (date, defaultReturn) => {
  if (date !== null && date !== undefined) {
    return new Date(date).toISOString()
  }
  return defaultReturn
}

/**
 * @param {UserAccount} userAccountDao
 * @return {UserAccountDto}
 */
const mapUserDaoToDto = (userAccountDao) => {
  return {
    id: userAccountDao.id,
    policeForceId: userAccountDao.police_force_id ?? undefined,
    username: userAccountDao.username,
    active: userAccountDao.active,
    accepted: isoDateOrDefault(userAccountDao.accepted_terms_and_conds_date, false),
    activated: isoDateOrDefault(userAccountDao.activated_date, false),
    createdAt: isoDateOrDefault(userAccountDao.created_at),
    policeForce: userAccountDao.police_force?.name,
    lastLogin: isoDateOrDefault(userAccountDao.last_login_date, false)
  }
}

module.exports = {
  mapUserDaoToDto
}
