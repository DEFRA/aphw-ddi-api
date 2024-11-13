const { getMicrochip, getMicrochips, calculateNeuteringDeadline, stripTime } = require('../../../../app/dto/dto-helper')

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

  test('getMicrochips should get sorted microchips', () => {
    const res = getMicrochips({
      dog_microchips: [
        { id: 5, microchip: { microchip_number: 'ABC123', display_order: 2, id: 5 } },
        { id: 3, microchip: { microchip_number: 'DEF456', display_order: 1, id: 3 } }
      ]
    })
    expect(res[0].microchip.microchip_number).toBe('DEF456')
    expect(res[1].microchip.microchip_number).toBe('ABC123')
  })

  test('calculateNeuteringDeadline should return 2024-12-31 if less than 1 year old', () => {
    const deadline = calculateNeuteringDeadline(new Date('2023-02-01'))

    expect(deadline).toEqual(new Date('2025-06-30'))
  })

  test('calculateNeuteringDeadline should return 2024-06-30 if at least 1 year old', () => {
    const deadline = calculateNeuteringDeadline(new Date('2023-01-31'))

    expect(deadline).toEqual(new Date('2024-06-30'))
  })

  test('calculateNeuteringDeadline should return null if dateOfBirth is null', () => {
    const deadline = calculateNeuteringDeadline(null)

    expect(deadline).toBeNull()
  })

  describe('stripTime', () => {
    test('stripTime should handle null', () => {
      const dateOnly = stripTime(null)

      expect(dateOnly).toBeNull()
    })

    test('stripTime should handle empty string', () => {
      const dateOnly = stripTime('')

      expect(dateOnly).toBeNull()
    })

    test('stripTime remove time', () => {
      const dateOnly = stripTime(new Date(2000, 1, 1, 15, 4, 22))

      expect(dateOnly).toBe('2000-02-01')
    })
  })
})
