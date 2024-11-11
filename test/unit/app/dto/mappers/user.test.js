const { mapUserDaoToDto } = require('../../../../../app/dto/mappers/user')
const { buildUserAccount } = require('../../../../mocks/user-accounts')
const { buildPoliceForceDao } = require('../../../../mocks/cdo/get')
describe('user mappers', () => {
  describe('mapUserDaoToDto', () => {
    test('should map a user dao to dto', () => {
      const date = new Date('2024-10-06')
      /**
       * @type {UserAccount}
       */
      const userAccount = buildUserAccount({
        id: 1,
        username: 'jim.jordan@gotham.police.gov',
        police_force_id: 1,
        police_force: buildPoliceForceDao({
          id: 1,
          name: 'Gotham City Police Department',
          short_name: 'gotham'
        }),
        created_at: date,
        activated_date: date,
        accepted_terms_and_conds_date: date,
        last_login_date: date
      })

      const expectedUserDto = {
        id: 1,
        username: 'jim.jordan@gotham.police.gov',
        policeForceId: 1,
        active: true,
        activated: '2024-10-06T00:00:00.000Z',
        policeForce: 'Gotham City Police Department',
        accepted: '2024-10-06T00:00:00.000Z',
        lastLogin: '2024-10-06T00:00:00.000Z',
        createdAt: '2024-10-06T00:00:00.000Z'
      }

      expect(mapUserDaoToDto(userAccount)).toEqual(expectedUserDto)
    })

    test('should map a user dao to dto without police force', () => {
      /**
       * @type {UserAccount}
       */
      const userAccount = buildUserAccount({
        id: 1,
        username: 'jane.doe@example.com',
        police_force_id: null,
        activated_date: null,
        activation_token: null,
        activation_token_expiry: null,
        active: true,
        created_at: null,
        last_login_date: null,
        updated_at: null,
        accepted_terms_and_conds_date: null
      })

      const expectedUserDto = {
        id: 1,
        username: 'jane.doe@example.com',
        active: true,
        createdAt: undefined,
        accepted: false,
        activated: false,
        lastLogin: false,
        policeForce: undefined,
        policeForceId: undefined
      }

      expect(mapUserDaoToDto(userAccount)).toEqual(expectedUserDto)
    })
  })
})
