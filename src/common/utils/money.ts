import Decimal from 'decimal.js';
import { Money, Percentage } from '../types';

/**
 * Money utility - all internal calculations use Decimal.js to avoid floating-point issues.
 * Money is stored as paisa (1/100 of a rupee) in the database.
 */
export class MoneyUtil {
  /** Convert rupees to paisa for storage */
  static toPaisa(rupees: number): Money {
    return new Decimal(rupees).times(100).round().toNumber();
  }

  /** Convert paisa to rupees for display */
  static toRupees(paisa: Money): number {
    return new Decimal(paisa).dividedBy(100).toNumber();
  }

  /** Add two money values (in paisa) */
  static add(a: Money, b: Money): Money {
    return new Decimal(a).plus(b).round().toNumber();
  }

  /** Subtract b from a (in paisa) */
  static subtract(a: Money, b: Money): Money {
    return new Decimal(a).minus(b).round().toNumber();
  }

  /** Multiply money by a factor */
  static multiply(amount: Money, factor: number): Money {
    return new Decimal(amount).times(factor).round().toNumber();
  }

  /** Divide money, rounding to nearest paisa */
  static divide(amount: Money, divisor: number): Money {
    if (divisor === 0) throw new Error('Division by zero');
    return new Decimal(amount).dividedBy(divisor).round().toNumber();
  }

  /** Calculate percentage of an amount. Rate in basis points (1200 = 12%) */
  static percentage(amount: Money, rateBasisPoints: Percentage): Money {
    return new Decimal(amount)
      .times(rateBasisPoints)
      .dividedBy(10000)
      .round()
      .toNumber();
  }

  /** Convert a regular percentage (e.g., 12.5) to basis points (1250) */
  static toBasisPoints(percent: number): Percentage {
    return new Decimal(percent).times(100).round().toNumber();
  }

  /** Convert basis points to regular percentage */
  static fromBasisPoints(basisPoints: Percentage): number {
    return new Decimal(basisPoints).dividedBy(100).toNumber();
  }

  /** Pro-rata calculation: (amount * paidDays) / totalDays */
  static proRata(monthlyAmount: Money, paidDays: number, totalDays: number): Money {
    if (totalDays === 0) return 0;
    return new Decimal(monthlyAmount)
      .times(paidDays)
      .dividedBy(totalDays)
      .round()
      .toNumber();
  }

  /** Round to nearest rupee (100 paisa) */
  static roundToRupee(paisa: Money): Money {
    return new Decimal(paisa).dividedBy(100).round().times(100).toNumber();
  }

  /** Format as INR string */
  static formatINR(paisa: Money): string {
    const rupees = MoneyUtil.toRupees(paisa);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(rupees);
  }

  /** Sum an array of money values */
  static sum(amounts: Money[]): Money {
    return amounts.reduce((acc, val) => MoneyUtil.add(acc, val), 0);
  }

  /** Allocate amount across N parts with remainder handling */
  static allocate(amount: Money, parts: number): Money[] {
    if (parts <= 0) return [];
    const base = Math.floor(amount / parts);
    const remainder = amount - base * parts;
    const result: Money[] = [];
    for (let i = 0; i < parts; i++) {
      result.push(i < remainder ? base + 1 : base);
    }
    return result;
  }

  /** Weighted allocation of amount */
  static allocateByWeights(amount: Money, weights: number[]): Money[] {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return weights.map(() => 0);

    const allocated = weights.map((w) =>
      new Decimal(amount).times(w).dividedBy(totalWeight).floor().toNumber()
    );
    const totalAllocated = allocated.reduce((a, b) => a + b, 0);
    const diff = amount - totalAllocated;
    if (diff > 0) allocated[0] += diff; // assign remainder to first
    return allocated;
  }
}
