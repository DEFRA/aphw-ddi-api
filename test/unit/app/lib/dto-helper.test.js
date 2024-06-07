const { getMicrochip, calculateNeuteringDeadline } = require('../../../../app/dto/dto-helper')

describe('DtoHelper test', () => {
  test('getMicrochip should handle null', () => {
    const res = getMicrochip({}, 1)
    expect(res).toBe(null)
  })

  test('getMicrochip should get microchip 1', () => {
    const res = getMicrochip({
      dog_microchips: [
        { microchip: { microchip_number: 'ABC123', display_order: 1 } },
        { microchip: { microchip_number: 'DEF456', display_order: 2 } }
      ]
    }, 1)
    expect(res).toBe('ABC123')
  })

  test('getMicrochip should get microchip 2', () => {
    const res = getMicrochip({
      dog_microchips: [
        { microchip: { microchip_number: 'ABC123', display_order: 1 } },
        { microchip: { microchip_number: 'DEF456', display_order: 2 } }
      ]
    }, 2)
    expect(res).toBe('DEF456')
  })

  test('calculateNeuteringDeadline should return 2024-12-31 if less than 1 year old', () => {
    const deadline = calculateNeuteringDeadline(new Date('2023-02-01'))

    expect(deadline).toEqual(new Date('2024-12-31'))
  })

  test('calculateNeuteringDeadline should return 2024-06-30 if at least 1 year old', () => {
    const deadline = calculateNeuteringDeadline(new Date('2023-01-31'))

    expect(deadline).toEqual(new Date('2024-06-30'))
  })

  test('calculateNeuteringDeadline should return null if dateOfBirth is null', () => {
    const deadline = calculateNeuteringDeadline(null)

    expect(deadline).toBeNull()
  })
})
