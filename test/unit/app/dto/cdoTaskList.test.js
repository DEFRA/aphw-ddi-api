const { buildCdo, buildExemption, buildCdoInsurance, buildCdoDog, buildCdoPerson } = require('../../../mocks/cdo/domain')
const { CdoTaskList } = require('../../../../app/data/domain')
const { mapCdoTaskListToDto } = require('../../../../app/dto/cdoTaskList')
const { buildCdoTaskListDto, buildCdoTaskListDtoTasks } = require('../../../mocks/cdo/dto')

describe('mapCdoTaskListToDto', () => {
  test('should map cdoTaskListToDto', () => {
    const cdo = buildCdo({
      person: buildCdoPerson({
        firstName: 'Alex',
        lastName: 'Carter'
      }),
      dog: buildCdoDog({
        name: 'Rex'
      }),
      exemption: buildExemption({
        cdoExpiry: new Date('9999-10-10')
      })
    })
    const cdoTaskList = new CdoTaskList(cdo)
    const cdoTaskListDto = mapCdoTaskListToDto(cdoTaskList)
    const expectedDto = buildCdoTaskListDto({
      indexNumber: 'ED300097',
      tasks: buildCdoTaskListDtoTasks({
        applicationPackSent: {
          key: 'applicationPackSent',
          available: true,
          completed: false,
          readonly: false,
          timestamp: undefined
        }
      }),
      applicationPackSent: undefined,
      insuranceCompany: undefined,
      insuranceRenewal: undefined,
      microchipNumber: undefined,
      applicationFeePaid: undefined,
      form2Sent: undefined,
      neuteringConfirmation: undefined,
      microchipVerification: undefined,
      certificateIssued: undefined,
      cdoSummary: {
        dog: {
          name: 'Rex'
        },
        person: {
          firstName: 'Alex',
          lastName: 'Carter'
        },
        exemption: {
          cdoExpiry: new Date('9999-10-10')
        }
      }
    })

    expect(cdoTaskListDto).toEqual(expectedDto)
    expect(Object.hasOwn(cdoTaskListDto, 'applicationPackSent')).toBe(true)
    expect(Object.hasOwn(cdoTaskListDto, 'insuranceCompany')).toBe(true)
    expect(Object.hasOwn(cdoTaskListDto, 'insuranceRenewal')).toBe(true)
    expect(Object.hasOwn(cdoTaskListDto, 'microchipNumber')).toBe(true)
    expect(Object.hasOwn(cdoTaskListDto, 'applicationFeePaid')).toBe(true)
    expect(Object.hasOwn(cdoTaskListDto, 'form2Sent')).toBe(true)
    expect(Object.hasOwn(cdoTaskListDto, 'neuteringConfirmation')).toBe(true)
    expect(Object.hasOwn(cdoTaskListDto, 'microchipVerification')).toBe(true)
    expect(Object.hasOwn(cdoTaskListDto, 'certificateIssued')).toBe(true)
  })

  test('should show insuranceCompany', () => {
    const cdo = buildCdo({
      exemption: buildExemption({
        insurance: [
          buildCdoInsurance({
            company: 'Pets R Us',
            renewalDate: undefined
          })
        ]
      })
    })
    const cdoTaskList = new CdoTaskList(cdo)
    const cdoTaskListDto = mapCdoTaskListToDto(cdoTaskList)
    const expectedDto = buildCdoTaskListDto({
      tasks: buildCdoTaskListDtoTasks({
        applicationPackSent: {
          key: 'applicationPackSent',
          available: true,
          completed: false,
          readonly: false,
          timestamp: undefined
        }
      }),
      applicationPackSent: undefined,
      insuranceCompany: 'Pets R Us',
      insuranceRenewal: undefined,
      microchipNumber: undefined,
      applicationFeePaid: undefined,
      form2Sent: undefined,
      neuteringConfirmation: undefined,
      microchipVerification: undefined,
      certificateIssued: undefined,
      cdoSummary: {
        dog: {
          name: 'Rex300'
        },
        person: {
          firstName: 'Alex',
          lastName: 'Carter'
        },
        exemption: {
          cdoExpiry: new Date('2023-12-10')
        }
      }
    })
    expect(cdoTaskListDto).toEqual(expectedDto)
  })

  test('should return all the data for a complete CdoTaskList', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 60)

    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25'),
      form2Sent: new Date('2024-05-24'),
      applicationFeePaid: new Date('2024-06-24'),
      neuteringConfirmation: new Date('2024-02-10'),
      microchipVerification: new Date('2024-03-09'),
      microchipDeadline: new Date('2024-03-09'),
      insurance: [buildCdoInsurance({
        company: 'Dogs R Us',
        renewalDate: futureDate
      })],
      certificateIssued: new Date('2024-06-27')
    })
    const dogProperties = buildCdoDog({
      microchipNumber: '123456789012345',
      microchipNumber2: '123456789012346'
    })
    const cdo = buildCdo({
      dog: dogProperties,
      exemption: exemptionProperties
    })
    const cdoTaskList = new CdoTaskList(cdo)
    const cdoTaskListDto = mapCdoTaskListToDto(cdoTaskList)

    expect(cdoTaskListDto).toEqual(expect.objectContaining({
      applicationPackSent: new Date('2024-06-25'),
      insuranceCompany: cdoTaskList.cdoSummary.insuranceCompany,
      insuranceRenewal: futureDate,
      microchipNumber: '123456789012345',
      microchipNumber2: '123456789012346',
      applicationFeePaid: new Date('2024-06-24'),
      form2Sent: new Date('2024-05-24'),
      neuteringConfirmation: new Date('2024-02-10'),
      microchipVerification: new Date('2024-03-09'),
      microchipDeadline: new Date('2024-03-09'),
      certificateIssued: new Date('2024-06-27'),
      verificationOptions: {
        dogDeclaredUnfit: expect.any(Boolean),
        neuteringBypassedUnder16: expect.any(Boolean),
        allowDogDeclaredUnfit: expect.any(Boolean),
        allowNeuteringBypass: expect.any(Boolean),
        showNeuteringBypass: expect.any(Boolean)
      }
    }))
  })
})
