const { personMatchCodesStandard } = require('./persons')
const generatePersonMatchCodes = require('../../../../app/import/access/person-match-codes')

describe('PersonMatchCodes test', () => {
  test('generatePersonMatchCodes returns firstname and lastname only by default', () => {
    const config = {}
    const matchCodes = generatePersonMatchCodes(personMatchCodesStandard, config)
    expect(matchCodes).not.toBe(null)
    expect(matchCodes.length).toBe(1)
    expect(matchCodes[0]).toBe('john^smith^1 anywhere st^ab1 2cd')
  })

  test('generatePersonMatchCodes returns firstname and lastname swapped', () => {
    const config = { includeSwappedNames: true }
    const matchCodes = generatePersonMatchCodes(personMatchCodesStandard, config)
    expect(matchCodes).not.toBe(null)
    expect(matchCodes.length).toBe(2)
    expect(matchCodes[0]).toBe('john^smith^1 anywhere st^ab1 2cd')
    expect(matchCodes[1]).toBe('smith^john')
  })

  test('generatePersonMatchCodes returns algo 1 codes', () => {
    const config = { includeFuzzyAlgo1: true }
    const matchCodes = generatePersonMatchCodes(personMatchCodesStandard, config)
    expect(matchCodes).not.toBe(null)
    expect(matchCodes.length).toBe(3)
    expect(matchCodes[0]).toBe('john^smith^1 anywhere st^ab1 2cd')
    expect(matchCodes[1]).toBe('160000^463000')
    expect(matchCodes[2]).toBe('460000^463000')
  })

  test('generatePersonMatchCodes returns algo 1 codes with swaps', () => {
    const config = { includeFuzzyAlgo1: true, includeSwappedNames: true }
    const matchCodes = generatePersonMatchCodes(personMatchCodesStandard, config)
    expect(matchCodes).not.toBe(null)
    expect(matchCodes.length).toBe(6)
    expect(matchCodes[0]).toBe('john^smith^1 anywhere st^ab1 2cd')
    expect(matchCodes[1]).toBe('smith^john')
    expect(matchCodes[2]).toBe('160000^463000')
    expect(matchCodes[3]).toBe('460000^463000')
    expect(matchCodes[4]).toBe('463000^160000')
    expect(matchCodes[5]).toBe('463000^460000')
  })

  test('generatePersonMatchCodes returns algo 2 codes', () => {
    const config = { includeFuzzyAlgo2: true }
    const matchCodes = generatePersonMatchCodes(personMatchCodesStandard, config)
    expect(matchCodes).not.toBe(null)
    expect(matchCodes.length).toBe(2)
    expect(matchCodes[0]).toBe('john^smith^1 anywhere st^ab1 2cd')
    expect(matchCodes[1]).toBe('JAN^SNATH')
  })

  test('generatePersonMatchCodes returns algo 2 codes with swaps', () => {
    const config = { includeFuzzyAlgo2: true, includeSwappedNames: true }
    const matchCodes = generatePersonMatchCodes(personMatchCodesStandard, config)
    expect(matchCodes).not.toBe(null)
    expect(matchCodes.length).toBe(4)
    expect(matchCodes[0]).toBe('john^smith^1 anywhere st^ab1 2cd')
    expect(matchCodes[1]).toBe('smith^john')
    expect(matchCodes[2]).toBe('JAN^SNATH')
    expect(matchCodes[3]).toBe('SNATH^JAN')
  })
})
