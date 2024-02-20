const { preChangedDogAudit } = require('../../../../../app/dto/auditing/dog')

describe('DogAudit test', () => {
  test('pre should handle undefined', () => {
    const dog = { }
    const res = preChangedDogAudit(dog)
    expect(res).toEqual({
      dog_name: '',
      breed_type: null,
      colour: '',
      sex: '',
      dog_date_of_birth: null,
      dog_date_of_death: null,
      tattoo: '',
      microchip1: null,
      microchip2: null,
      date_exported: null,
      date_stolen: null,
      date_untraceable: null,
      status: null
    })
  })

  test('pre should handle simple fields', () => {
    const dog = {
      name: 'Bruno',
      dog_breed: {
        breed: 'breed1'
      },
      colour: 'Brown',
      sex: 'Male',
      birth_date: new Date(2024, 1, 3),
      death_date: new Date(2024, 1, 4),
      tattoo: 'tatoo1',
      exported_date: new Date(2024, 1, 8),
      stolen_date: new Date(2024, 1, 9),
      untraceable_date: new Date(2024, 1, 10),
      status: {
        status: 'Exempt'
      }
    }
    const res = preChangedDogAudit(dog)
    expect(res).toEqual({
      dog_name: 'Bruno',
      breed_type: 'breed1',
      colour: 'Brown',
      sex: 'Male',
      dog_date_of_birth: '2024-02-03',
      dog_date_of_death: '2024-02-04',
      tattoo: 'tatoo1',
      microchip1: null,
      microchip2: null,
      date_exported: '2024-02-08',
      date_stolen: '2024-02-09',
      date_untraceable: '2024-02-10',
      status: 'Exempt'
    })
  })

  test('pre should handle microchips', () => {
    const dog = {
      dog_microchips: [
        { id: 2, microchip: { id: 2, microchip_number: '22222' } },
        { id: 1, microchip: { id: 1, microchip_number: '11111' } }
      ]
    }
    const res = preChangedDogAudit(dog)
    expect(res).toEqual({
      dog_name: '',
      breed_type: null,
      colour: '',
      sex: '',
      dog_date_of_birth: null,
      dog_date_of_death: null,
      tattoo: '',
      microchip1: '11111',
      microchip2: '22222',
      date_exported: null,
      date_stolen: null,
      date_untraceable: null,
      status: null
    })
  })
})
