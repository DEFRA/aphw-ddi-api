const { getMicrochip } = require('../../../../app/dto/dto-helper')

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
})
