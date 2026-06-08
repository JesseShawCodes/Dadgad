import { progressCalculation } from "../services/progressCalculationService";

describe("progressCalculation", () => {
  describe("Championship Mode (championship = true)", () => {
    it("should calculate the sum of progress in championshipBracket", () => {
      const state = {
        championshipBracket: {
          key1: { progress: 10 },
          key2: { progress: 20 },
          key3: { progress: 30 },
        },
      };
      const result = progressCalculation(state, 0, 0, true);
      expect(result).toBe(60);
    });

    it("should include initial groupProg in the calculation", () => {
      const state = {
        championshipBracket: {
          key1: { progress: 10 },
        },
      };
      const result = progressCalculation(state, 100, 0, true);
      expect(result).toBe(110);
    });

    it("should return initial groupProg if championshipBracket is empty", () => {
      const state = {
        championshipBracket: {},
      };
      const result = progressCalculation(state, 50, 0, true);
      expect(result).toBe(50);
    });
  });

  describe("Regular Mode (championship = false)", () => {
    it("should calculate the average progress for the current round", () => {
      const state = {
        round: 1,
        bracket: {
          match1: { round1: { progress: 50 } },
          match2: { round1: { progress: 100 } },
        },
      };
      const length = 2;
      const result = progressCalculation(state, 0, length, false);
      expect(result).toBe(75); // (50 + 100) / 2
    });

    it("should include initial groupProg in the sum before dividing by length", () => {
      const state = {
        round: 1,
        bracket: {
          match1: { round1: { progress: 50 } },
        },
      };
      const length = 1;
      const result = progressCalculation(state, 50, length, false);
      expect(result).toBe(100); // (50 + 50) / 1
    });

    it("should handle multiple rounds and pick the correct one", () => {
      const state = {
        round: 2,
        bracket: {
          match1: {
            round1: { progress: 100 },
            round2: { progress: 25 },
          },
        },
      };
      const length = 1;
      const result = progressCalculation(state, 0, length, false);
      expect(result).toBe(25);
    });

    it("should return NaN if length is 0 (division by zero)", () => {
      const state = {
        round: 1,
        bracket: {
          match1: { round1: { progress: 50 } },
        },
      };
      const result = progressCalculation(state, 0, 0, false);
      expect(result).toBe(Infinity); // 50 / 0
    });
  });
});
