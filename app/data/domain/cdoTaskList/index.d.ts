/* istanbul ignore file */

export interface CdoTaskRuleInterface {
  get available(): boolean
  get completed(): boolean
  get readonly(): boolean
  get timestamp(): Date|undefined
}