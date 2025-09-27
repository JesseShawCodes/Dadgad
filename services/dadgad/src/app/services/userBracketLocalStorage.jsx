export function checkForArtistBracket(artist, storedBrackets) {
  if (!storedBrackets || storedBrackets.length == 0) {
    return false;
  } else {
    // Check if storedbracket contains a bracket with artist ID
    for (var i = 0; i < storedBrackets.length; i++) {
      let artistCheck = storedBrackets[i].artist == artist;
      if (!artistCheck) {
        continue;
      } else {
        return true
      }
    }
  }
}

function updateArtistBracket(artist, storedBrackets, newBracket) {
  return storedBrackets.map(bracket => 
    bracket.artist === artist ? { ...bracket, ...newBracket } : bracket
  );
}

export function updateUserBracketLocalStorage(currentBracket) {
  var userBracketStored = JSON.parse(localStorage.getItem("userBracket")) || [];
  
  let bracketIsStored = checkForArtistBracket(currentBracket.artist, userBracketStored);

  if (!bracketIsStored) {
    userBracketStored.push(currentBracket);
    localStorage.setItem("userBracket", JSON.stringify(userBracketStored));
  } else {
    let updatedBracket = updateArtistBracket(currentBracket.artist, userBracketStored, currentBracket);
    localStorage.setItem("userBracket", JSON.stringify(updatedBracket));
  }
}
