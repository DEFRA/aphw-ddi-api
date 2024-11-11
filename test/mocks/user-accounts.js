/**
 * @param {Partial<UserAccount>} userAccountPartial
 * @return {UserAccount}
 */
const buildUserAccount = (userAccountPartial) => ({
  id: 1,
  username: 'user@example.com',
  police_force_id: null,
  telephone: null,
  activated_date: null,
  activation_token: null,
  activation_token_expiry: null,
  created_at: null,
  last_login_date: null,
  updated_at: null,
  active: true,
  police_force: null,
  accepted_terms_and_conds_date: null,
  ...userAccountPartial
})

const buildUserDto = (userDtoPartial) => ({
  id: 1,
  username: 'jane.doe@example.com',
  active: true,
  createdAt: undefined,
  accepted: false,
  activated: false,
  lastLogin: false,
  policeForce: undefined,
  policeForceId: undefined,
  ...userDtoPartial
})

module.exports = {
  buildUserAccount,
  buildUserDto
}
