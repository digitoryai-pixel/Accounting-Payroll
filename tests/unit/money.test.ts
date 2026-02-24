import { MoneyUtil } from '../../src/common/utils/money';

describe('MoneyUtil', () => {
  describe('toPaisa / toRupees', () => {
    it('converts rupees to paisa', () => {
      expect(MoneyUtil.toPaisa(100)).toBe(10000);
      expect(MoneyUtil.toPaisa(15000)).toBe(1500000);
      expect(MoneyUtil.toPaisa(0.50)).toBe(50);
    });

    it('converts paisa to rupees', () => {
      expect(MoneyUtil.toRupees(10000)).toBe(100);
      expect(MoneyUtil.toRupees(1500000)).toBe(15000);
      expect(MoneyUtil.toRupees(50)).toBe(0.5);
    });
  });

  describe('arithmetic', () => {
    it('adds two amounts', () => {
      expect(MoneyUtil.add(10000, 5000)).toBe(15000);
    });

    it('subtracts amounts', () => {
      expect(MoneyUtil.subtract(10000, 3000)).toBe(7000);
    });

    it('multiplies amount by factor', () => {
      expect(MoneyUtil.multiply(10000, 1.5)).toBe(15000);
    });

    it('divides amount', () => {
      expect(MoneyUtil.divide(10000, 4)).toBe(2500);
    });

    it('throws on division by zero', () => {
      expect(() => MoneyUtil.divide(10000, 0)).toThrow('Division by zero');
    });
  });

  describe('percentage', () => {
    it('calculates 12% of ₹15,000 (PF calculation)', () => {
      const basic = MoneyUtil.toPaisa(15000); // 1,500,000 paisa
      const pf = MoneyUtil.percentage(basic, 1200); // 12% = 1200 basis points
      expect(MoneyUtil.toRupees(pf)).toBe(1800); // ₹1,800
    });

    it('calculates 0.75% of ₹21,000 (ESI employee)', () => {
      const gross = MoneyUtil.toPaisa(21000);
      const esi = MoneyUtil.percentage(gross, 75); // 0.75% = 75 basis points
      expect(MoneyUtil.toRupees(esi)).toBe(157.5);
    });
  });

  describe('proRata', () => {
    it('calculates pro-rata for 22 paid days out of 30', () => {
      const monthly = MoneyUtil.toPaisa(30000); // ₹30,000
      const proRata = MoneyUtil.proRata(monthly, 22, 30);
      expect(MoneyUtil.toRupees(proRata)).toBe(22000);
    });

    it('returns 0 for 0 total days', () => {
      expect(MoneyUtil.proRata(100000, 22, 0)).toBe(0);
    });
  });

  describe('formatINR', () => {
    it('formats amount in Indian Rupees', () => {
      const formatted = MoneyUtil.formatINR(MoneyUtil.toPaisa(25000));
      expect(formatted).toContain('25,000');
    });
  });

  describe('allocate', () => {
    it('allocates evenly with remainder', () => {
      const parts = MoneyUtil.allocate(10003, 3);
      expect(parts).toEqual([3335, 3334, 3334]);
      expect(parts.reduce((a, b) => a + b, 0)).toBe(10003);
    });

    it('returns empty for 0 parts', () => {
      expect(MoneyUtil.allocate(10000, 0)).toEqual([]);
    });
  });

  describe('allocateByWeights', () => {
    it('allocates by weights (tip distribution)', () => {
      const total = MoneyUtil.toPaisa(10000); // ₹10,000
      const weights = [3, 2, 1]; // 50%, 33.3%, 16.7%
      const allocated = MoneyUtil.allocateByWeights(total, weights);
      expect(allocated.reduce((a, b) => a + b, 0)).toBe(total);
      expect(allocated[0]).toBeGreaterThan(allocated[1]);
      expect(allocated[1]).toBeGreaterThan(allocated[2]);
    });
  });

  describe('basisPoints', () => {
    it('converts percentage to basis points', () => {
      expect(MoneyUtil.toBasisPoints(12)).toBe(1200);
      expect(MoneyUtil.toBasisPoints(0.75)).toBe(75);
      expect(MoneyUtil.toBasisPoints(100)).toBe(10000);
    });

    it('converts basis points to percentage', () => {
      expect(MoneyUtil.fromBasisPoints(1200)).toBe(12);
      expect(MoneyUtil.fromBasisPoints(75)).toBe(0.75);
    });
  });

  describe('sum', () => {
    it('sums array of amounts', () => {
      expect(MoneyUtil.sum([1000, 2000, 3000, 4000])).toBe(10000);
    });

    it('returns 0 for empty array', () => {
      expect(MoneyUtil.sum([])).toBe(0);
    });
  });
});
