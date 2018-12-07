import { ScrapingResult } from '../../ScrapingResult'
import { ScrapingSite } from '../Site'

export default new class extends ScrapingSite {
  public readonly match = /^https:\/\/ws-tcg.com\/cardlist\/\?cardno=([A-Z0-9\/-]*)(?:&.*)?$/

  protected fetch(u: void): ScrapingResult {
    return {}
  }
}