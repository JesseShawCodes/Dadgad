import {
  checkForArtistBracket,
  updateUserBracketLocalStorage,
} from "../services/userBracketLocalStorage";

describe("userBracketLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("checkForArtistBracket", () => {
    it("returns false when stored brackets are missing", () => {
      expect(checkForArtistBracket("artist-1", undefined)).toBe(false);
    });

    it("returns false when stored brackets are empty", () => {
      expect(checkForArtistBracket("artist-1", [])).toBe(false);
    });

    it("returns true when the artist exists in stored brackets", () => {
      const storedBrackets = [{ artist: "artist-1" }, { artist: "artist-2" }];
      expect(checkForArtistBracket("artist-2", storedBrackets)).toBe(true);
    });

    it("returns a falsy value when the artist does not exist", () => {
      const storedBrackets = [{ artist: "artist-1" }, { artist: "artist-2" }];
      expect(checkForArtistBracket("artist-3", storedBrackets)).toBeFalsy();
    });
  });

  describe("updateUserBracketLocalStorage", () => {
    it("stores the current bracket when localStorage is empty", () => {
      const currentBracket = { artist: "artist-1", selectedSongs: [1, 2] };

      updateUserBracketLocalStorage(currentBracket);

      expect(JSON.parse(window.localStorage.getItem("userBracket"))).toEqual([
        currentBracket,
      ]);
    });

    it("adds a new bracket when a different artist is already stored", () => {
      const existingBracket = { artist: "artist-1", selectedSongs: [1] };
      window.localStorage.setItem("userBracket", JSON.stringify([existingBracket]));
      const currentBracket = { artist: "artist-2", selectedSongs: [3, 4] };

      updateUserBracketLocalStorage(currentBracket);

      expect(JSON.parse(window.localStorage.getItem("userBracket"))).toEqual([
        existingBracket,
        currentBracket,
      ]);
    });

    it("updates an existing artist bracket and preserves untouched fields", () => {
      const existingBracket = {
        artist: "artist-1",
        selectedSongs: [1],
        bracketName: "Original",
      };
      const secondBracket = { artist: "artist-2", selectedSongs: [9] };
      window.localStorage.setItem(
        "userBracket",
        JSON.stringify([existingBracket, secondBracket])
      );

      updateUserBracketLocalStorage({
        artist: "artist-1",
        selectedSongs: [2, 3],
      });

      expect(JSON.parse(window.localStorage.getItem("userBracket"))).toEqual([
        {
          artist: "artist-1",
          selectedSongs: [2, 3],
          bracketName: "Original",
        },
        secondBracket,
      ]);
    });
  });
});
