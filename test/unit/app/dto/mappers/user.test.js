const { mapUserDaoToDto } = require('../../../../../app/dto/mappers/user')
describe('user mappers', () => {
  describe('mapUserDaoToDto', () => {
    test('should map a user dao to dto', () => {
      /**
       * @type {UserAccount}
       */
      const userAccount = {
        id: 1,
        username: 'jim.jordan@gotham.police.gov',
        police_force_id: 1,
        activated_date: null,
        activation_token: null,
        activation_token_expiry: null,
        active: true,
        created_at: new Date(),
        last_login_date: null,
        updated_at: new Date(),
        accepted_terms_and_conds_date: null
      }

      const expectedUserDto = {
        id: 1,
        username: 'jim.jordan@gotham.police.gov',
        police_force_id: 1,
        active: true
      }

      expect(mapUserDaoToDto(userAccount)).toEqual(expectedUserDto)
    })

    test('should map a user dao to dto without police force', () => {
      /**
       * @type {UserAccount}
       */
      const userAccount = {
        id: 1,
        username: 'jane.doe@example.com',
        police_force_id: null,
        activated_date: null,
        activation_token: null,
        activation_token_expiry: null,
        active: true,
        created_at: new Date(),
        last_login_date: null,
        updated_at: new Date(),
        accepted_terms_and_conds_date: null
      }

      const expectedUserDto = {
        id: 1,
        username: 'jane.doe@example.com',
        active: true
      }

      expect(mapUserDaoToDto(userAccount)).toEqual(expectedUserDto)
    })
  })
})
