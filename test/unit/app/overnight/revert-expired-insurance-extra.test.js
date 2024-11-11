const { moreThanJustExpiredInsurance, includesInsuranceExpiry } = require('../../../../app/overnight/revert-expired-insurance')

describe('Revert Expired Insurance extra tests', () => {
  test('includesInsuranceExpiry where no reasons', () => {
    const dog = { dog_breaches: [] }
    const res = includesInsuranceExpiry(dog, 11)
    expect(res).toBeFalsy()
  })

  test('includesInsuranceExpiry where single other reason', () => {
    const dog = { dog_breaches: [{ breach_category_id: 15 }] }
    const res = includesInsuranceExpiry(dog, 11)
    expect(res).toBeFalsy()
  })

  test('includesInsuranceExpiry where single expired reason', () => {
    const dog = { dog_breaches: [{ breach_category_id: 11 }] }
    const res = includesInsuranceExpiry(dog, 11)
    expect(res).toBeTruthy()
  })

  test('includesInsuranceExpiry where expired and other reasons', () => {
    const dog = { dog_breaches: [{ breach_category_id: 11 }, { breach_category_id: 1 }, { breach_category_id: 5 }] }
    const res = includesInsuranceExpiry(dog, 11)
    expect(res).toBeTruthy()
  })

  test('moreThanJustExpiredInsurance where no reasons', () => {
    const dog = { dog_breaches: null }
    const res = moreThanJustExpiredInsurance(dog, 11)
    expect(res).toBeFalsy()
  })

  test('moreThanJustExpiredInsurance where single expired reason', () => {
    const dog = { dog_breaches: [{ breach_category_id: 11 }] }
    const res = moreThanJustExpiredInsurance(dog, 11)
    expect(res).toBeFalsy()
  })

  test('moreThanJustExpiredInsurance where single expired reason', () => {
    const dog = { dog_breaches: [{ breach_category_id: 11 }, { breach_category_id: 15 }] }
    const res = moreThanJustExpiredInsurance(dog, 11)
    expect(res).toBeTruthy()
  })
})
