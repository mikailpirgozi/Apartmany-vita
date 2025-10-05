/**
 * Breakfast Price Calculation Tests
 * Tests to verify breakfast pricing logic is correct
 * NOTE: Breakfast prices are PER NIGHT and must be multiplied by number of nights
 */

describe('Breakfast Price Calculations', () => {
  const BREAKFAST_ADULT_PRICE = 9.90;
  const BREAKFAST_CHILD_PRICE = 5.90;

  describe('Single person calculations', () => {
    it('should calculate correct price for 1 adult', () => {
      const adults = 1;
      const children = 0;
      const total = (adults * BREAKFAST_ADULT_PRICE) + (children * BREAKFAST_CHILD_PRICE);
      expect(total).toBe(9.90);
    });

    it('should calculate correct price for 1 child', () => {
      const adults = 0;
      const children = 1;
      const total = (adults * BREAKFAST_ADULT_PRICE) + (children * BREAKFAST_CHILD_PRICE);
      expect(total).toBe(5.90);
    });
  });

  describe('Multiple people calculations', () => {
    it('should calculate correct price for 2 adults', () => {
      const adults = 2;
      const children = 0;
      const total = (adults * BREAKFAST_ADULT_PRICE) + (children * BREAKFAST_CHILD_PRICE);
      expect(total).toBe(19.80);
    });

    it('should calculate correct price for 2 adults + 2 children', () => {
      const adults = 2;
      const children = 2;
      const total = (adults * BREAKFAST_ADULT_PRICE) + (children * BREAKFAST_CHILD_PRICE);
      expect(total).toBe(31.60); // (2 × 9.90) + (2 × 5.90) = 19.80 + 11.80 = 31.60
    });

    it('should calculate correct price for 4 adults + 3 children', () => {
      const adults = 4;
      const children = 3;
      const total = (adults * BREAKFAST_ADULT_PRICE) + (children * BREAKFAST_CHILD_PRICE);
      expect(total).toBeCloseTo(57.30, 2); // (4 × 9.90) + (3 × 5.90) = 39.60 + 17.70 = 57.30
    });
  });

  describe('Edge cases', () => {
    it('should return 0 for no people', () => {
      const adults = 0;
      const children = 0;
      const total = (adults * BREAKFAST_ADULT_PRICE) + (children * BREAKFAST_CHILD_PRICE);
      expect(total).toBe(0);
    });

    it('should handle large groups', () => {
      const adults = 10;
      const children = 5;
      const total = (adults * BREAKFAST_ADULT_PRICE) + (children * BREAKFAST_CHILD_PRICE);
      expect(total).toBe(128.50); // (10 × 9.90) + (5 × 5.90) = 99.00 + 29.50 = 128.50
    });
  });

  describe('Multi-night stays', () => {
    it('should calculate correct price for 2 adults × 3 nights', () => {
      const adults = 2;
      const children = 0;
      const nights = 3;
      const perNight = (adults * BREAKFAST_ADULT_PRICE) + (children * BREAKFAST_CHILD_PRICE);
      const total = perNight * nights;
      expect(total).toBeCloseTo(59.40, 2); // (2 × 9.90) × 3 = 19.80 × 3 = 59.40
    });

    it('should calculate correct price for 2 adults + 1 child × 5 nights', () => {
      const adults = 2;
      const children = 1;
      const nights = 5;
      const perNight = (adults * BREAKFAST_ADULT_PRICE) + (children * BREAKFAST_CHILD_PRICE);
      const total = perNight * nights;
      expect(total).toBeCloseTo(128.50, 2); // ((2 × 9.90) + (1 × 5.90)) × 5 = 25.70 × 5 = 128.50
    });

    it('should calculate correct price for 1 week stay', () => {
      const adults = 2;
      const children = 2;
      const nights = 7;
      const perNight = (adults * BREAKFAST_ADULT_PRICE) + (children * BREAKFAST_CHILD_PRICE);
      const total = perNight * nights;
      expect(total).toBeCloseTo(221.20, 2); // ((2 × 9.90) + (2 × 5.90)) × 7 = 31.60 × 7 = 221.20
    });
  });

  describe('Price consistency', () => {
    it('adult price should be higher than child price', () => {
      expect(BREAKFAST_ADULT_PRICE).toBeGreaterThan(BREAKFAST_CHILD_PRICE);
    });

    it('prices should be positive numbers', () => {
      expect(BREAKFAST_ADULT_PRICE).toBeGreaterThan(0);
      expect(BREAKFAST_CHILD_PRICE).toBeGreaterThan(0);
    });

    it('prices should have max 2 decimal places', () => {
      const adultDecimals = (BREAKFAST_ADULT_PRICE.toString().split('.')[1] || '').length;
      const childDecimals = (BREAKFAST_CHILD_PRICE.toString().split('.')[1] || '').length;
      expect(adultDecimals).toBeLessThanOrEqual(2);
      expect(childDecimals).toBeLessThanOrEqual(2);
    });
  });
});
