import { progressCalculation, calculateDisplayProgress } from "../services/progressCalculationService";

describe("progressCalculation", () => {
  describe("Championship Mode (championship = true)", () => {
    it("should return progress for the current championship round", () => {
      const state = {
        round: 5,
        championshipBracket: {
          round5: { progress: 0.5 },
          round6: { progress: null, roundMatchups: null },
        },
      };
      const result = progressCalculation(state, 0, 0, true);
      expect(result).toBe(0.5);
    });

    it("should return 0 when the current championship round has no progress", () => {
      const state = {
        round: 6,
        championshipBracket: {
          round5: { progress: 1 },
          round6: { progress: null, roundMatchups: null },
        },
      };
      const result = progressCalculation(state, 0, 0, true);
      expect(result).toBe(0);
    });

    it("should return 0 if championshipBracket is empty", () => {
      const state = {
        round: 5,
        championshipBracket: {},
      };
      const result = progressCalculation(state, 0, 0, true);
      expect(result).toBe(0);
    });
  });

  describe("Regular Mode (championship = false)", () => {
    it("should calculate the average progress for the current round", () => {
      const state = {
        round: 1,
        bracket: {
          match1: { round1: { progress: 0.5 } },
          match2: { round1: { progress: 1 } },
        },
      };
      const length = 2;
      const result = progressCalculation(state, 0, length, false);
      expect(result).toBe(0.75);
    });

    it("should include initial groupProg in the sum before dividing by length", () => {
      const state = {
        round: 1,
        bracket: {
          match1: { round1: { progress: 0.5 } },
        },
      };
      const length = 1;
      const result = progressCalculation(state, 0.5, length, false);
      expect(result).toBe(1);
    });

    it("should handle multiple rounds and pick the correct one", () => {
      const state = {
        round: 2,
        bracket: {
          match1: {
            round1: { progress: 1 },
            round2: { progress: 0.25 },
          },
        },
      };
      const length = 1;
      const result = progressCalculation(state, 0, length, false);
      expect(result).toBe(0.25);
    });

    it('should return 0 if length is 0', () => {
      const state = {
        round: 1,
        bracket: {
          match1: { round1: { progress: 0.5 } },
        },
      };
      const result = progressCalculation(state, 0, 0, false);
      expect(result).toBe(0);
    });

    it('should use default parameters for groupProg and championship', () => {
      const state = {
        round: 1,
        bracket: {
          match1: { round1: { progress: 0.5 } },
        },
      };
      const result = progressCalculation(state, undefined, 1);
      expect(result).toBe(0.5);
    });

    it('should skip groups with missing progress for the current round', () => {
      const state = {
        round: 1,
        bracket: {
          match1: { round1: { /* progress missing */ } },
          match2: { round1: { progress: 1 } },
        },
      };
      const result = progressCalculation(state, 0, 2, false);
      expect(result).toBe(0.5);
    });
  });

  describe("calculateDisplayProgress", () => {
    it("uses grouped bracket progress during regular rounds", () => {
      const state = {
        round: 1,
        bracket: {
          group1: { round1: { progress: 1 } },
          group2: { round1: { progress: 0.5 } },
          group3: { round1: { progress: 0 } },
          group4: { round1: { progress: 0 } },
        },
        championshipBracket: {},
      };

      expect(calculateDisplayProgress(state)).toBe(0.375);
    });
  });
});
