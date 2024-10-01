/**
 * @param {Partial<UserAccount>} userAccountPartial
 * @return {UserAccount}
 */
const buildUserAccount = (userAccountPartial) => ({
  id: 1,
  username: 'user@example.com',
  police_force_id: undefined,
  activated_date: undefined,
  activation_token: undefined,
  activation_token_expiry: undefined,
  created_at: undefined,
  last_login_date: undefined,
  updated_at: undefined,
  active: true,
  accepted_terms_and_conds_date: undefined,
  ...userAccountPartial
})

module.exports = {
  buildUserAccount
}
