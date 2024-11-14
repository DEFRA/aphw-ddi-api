const constants = {
  statuses: {
    InterimExempt: 'Interim exempt',
    PreExempt: 'Pre-exempt',
    Exempt: 'Exempt',
    Failed: 'Failed',
    InBreach: 'In breach',
    Withdrawn: 'Withdrawn',
    Inactive: 'Inactive'
  },
  inactiveSubStatuses: {
    Dead: 'dead',
    Exported: 'exported',
    Stolen: 'stolen',
    Untraceable: 'untraceable'
  },
  breachReasons: {
    NOT_COVERED_BY_INSURANCE: 'NOT_COVERED_BY_INSURANCE',
    NOT_ON_LEAD_OR_MUZZLED: 'NOT_ON_LEAD_OR_MUZZLED',
    INSECURE_PLACE: 'INSECURE_PLACE',
    AWAY_FROM_ADDR_30_DAYS_IN_YR: 'AWAY_FROM_ADDR_30_DAYS_IN_YR',
    EXEMPTION_NOT_PROVIDED_TO_POLICE: 'EXEMPTION_NOT_PROVIDED_TO_POLICE',
    INSURANCE_NOT_PROVIDED_TO_POLICE: 'INSURANCE_NOT_PROVIDED_TO_POLICE',
    MICROCHIP_NOT_READ_BY_POLICE: 'MICROCHIP_NOT_READ_BY_POLICE',
    NO_CHANGE_OF_REG_ADDRESS: 'NO_CHANGE_OF_REG_ADDRESS',
    DOG_DEATH_NOT_REPORTED: 'DOG_DEATH_NOT_REPORTED',
    DOG_EXPORT_NOT_REPORTED: 'DOG_EXPORT_NOT_REPORTED',
    INSURANCE_EXPIRED: 'INSURANCE_EXPIRED',
    NEUTERING_DEADLINE_EXCEEDED: 'NEUTERING_DEADLINE_EXCEEDED',
    MICROCHIP_DEADLINE_EXCEEDED: 'MICROCHIP_DEADLINE_EXCEEDED'
  }
}

module.exports = constants
