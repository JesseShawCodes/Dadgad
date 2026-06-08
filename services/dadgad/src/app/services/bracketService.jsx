const bracketWeight = 5;
const bracketColor = '#000';
const matchUpSpace = 60;
const matchUpHeight = 160;

const round1Length = 200;

const bracketXStart = 10;

const width = 4200;

function getSongAttributes(group, iteration, songKey) {
  return group[iteration].attributes[songKey]?.song?.attributes;
}

function bracketContentSong(
  offScreenCanvas,
  yStart,
  rectStart,
  rectEnd,
  bgColor,
  songName,
  textColor,
  position,
  fontSize,
  rectangleHeight,
) {
  offScreenCanvas.textSize(fontSize);

  const padding = 10;

  const rectWidth = offScreenCanvas.textWidth(songName) + 2 * padding;

  let finalRectStart = rectStart;

  if (position === 'right') {
    const canvasWidth = offScreenCanvas.width || width;
    const endX = (canvasWidth) - 10 - (canvasWidth - rectStart);
    finalRectStart = endX - rectWidth;
  }

  offScreenCanvas.noStroke();
  offScreenCanvas.fill(`#${bgColor}`);

  const rectY = yStart - 20;
  const actualRectangleHeight = rectangleHeight + 10;
  offScreenCanvas.rect(finalRectStart, rectY, rectWidth, actualRectangleHeight, 12, 12, 12, 12);

  offScreenCanvas.fill(`#${textColor}`);

  // Calculate the vertical center of the rectangle
  const textY = rectY + actualRectangleHeight / 2;

  // Calculate the horizontal center of the rectangle
  const textX = finalRectStart + rectWidth / 2;

  // Set text alignment to center both horizontally and vertically
  offScreenCanvas.textAlign(offScreenCanvas.CENTER, offScreenCanvas.CENTER);

  offScreenCanvas.text(songName, textX, textY);

  // reset textAlign
  offScreenCanvas.textAlign(offScreenCanvas.LEFT, offScreenCanvas.TOP);
}

function bracketContent(
  offScreenCanvas,
  yStart,
  group,
  iteration,
  lineStartX,
  lineEndX,
  color,
  position,
  height,
  fontSize,
  rectangleHeight,
) {
  let songAttrs = getSongAttributes(group, iteration, 'song1');
  offScreenCanvas.stroke(color);
  offScreenCanvas.strokeWeight(bracketWeight);
  offScreenCanvas.line(lineStartX, yStart, lineEndX, yStart);
  offScreenCanvas.line(lineEndX, yStart, lineEndX, yStart + height);
  offScreenCanvas.line(lineEndX, yStart + height, lineStartX, yStart + height);
  offScreenCanvas.textSize(fontSize);
  bracketContentSong(
    offScreenCanvas,
    yStart,
    lineStartX,
    lineEndX,
    songAttrs.artwork.bgColor,
    songAttrs.name,
    songAttrs.artwork.textColor2,
    position,
    fontSize,
    rectangleHeight,
  );
  songAttrs = getSongAttributes(group, iteration, 'song2');
  bracketContentSong(
    offScreenCanvas,
    yStart + height,
    lineStartX,
    lineEndX,
    songAttrs.artwork.bgColor,
    songAttrs.name,
    songAttrs.artwork.textColor2,
    position,
    fontSize,
    rectangleHeight,
  );
}

const round = (
  offScreenCanvas,
  yStart,
  color,
  lineStartX,
  lineEndX,
  groupA,
  groupB,
  position,
  height,
  heightRatio = 1,
  fontSize,
  rectangleHeight,
) => {
  const groups = [groupA, groupB];
  let yStartAdjusted = yStart;
  for (let i = 0; i < groups.length; i += 1) {
    for (let r = 0; r < groups[i].length; r += 1) {
      bracketContent(
        offScreenCanvas,
        yStartAdjusted,
        groups[i],
        r,
        lineStartX,
        lineEndX,
        color,
        position,
        height,
        fontSize,
        rectangleHeight,
      );
      yStartAdjusted += (matchUpHeight * heightRatio) + (matchUpSpace * heightRatio);
    }
  }
};

const placeImage = (offScreenCanvas, imageLocation) => {
  const targetImageWidth = 400;
  const imgX = (width / 2) - (targetImageWidth / 2);
  // Temporarily dropped image placement. Will add back later
  // offScreenCanvas.image(imageLocation, imgX, 400, targetImageWidth, 400);
};

export default function bracket(state, offScreenCanvas, canvasHeight, image) {
  const rounds = [
    // Round 1
    {
      yStart: 55,
      color: bracketColor,
      lineStartX: bracketXStart,
      lineEndX: round1Length + bracketXStart,
      groupA: state.bracket.group1.round1.roundMatchups,
      groupB: state.bracket.group2.round1.roundMatchups,
      position: 'left',
      height: matchUpHeight,
    },
    {
      yStart: 55,
      color: bracketColor,
      lineStartX: width - bracketXStart,
      lineEndX: width - round1Length,
      groupA: state.bracket.group3.round1.roundMatchups,
      groupB: state.bracket.group4.round1.roundMatchups,
      position: 'right',
      height: matchUpHeight,
    },
    // Round 2
    {
      yStart: 55 + (matchUpHeight / 2),
      color: bracketColor,
      lineStartX: round1Length,
      lineEndX: 200 + 190,
      groupA: state.bracket.group1.round2.roundMatchups,
      groupB: state.bracket.group2.round2.roundMatchups,
      position: 'left',
      height: (matchUpHeight * 1.5),
      heightRatio: 2,
    },
    {
      yStart: 55 + (matchUpHeight / 2),
      color: bracketColor,
      lineStartX: width - round1Length,
      lineEndX: width - (200 + 190),
      groupA: state.bracket.group3.round2.roundMatchups,
      groupB: state.bracket.group4.round2.roundMatchups,
      position: 'right',
      height: (matchUpHeight * 1.5),
      heightRatio: 2,
    },
    // Round 3
    {
      yStart: 55 + (matchUpHeight * 1.5),
      color: bracketColor,
      lineStartX: 390,
      lineEndX: 640,
      groupA: state.bracket.group1.round3.roundMatchups,
      groupB: state.bracket.group2.round3.roundMatchups,
      position: 'left',
      height: (matchUpHeight * 2.5),
      heightRatio: 4,
    },
    {
      yStart: 55 + (matchUpHeight * 1.5),
      color: bracketColor,
      lineStartX: width - 390,
      lineEndX: width - 650,
      groupA: state.bracket.group3.round3.roundMatchups,
      groupB: state.bracket.group4.round3.roundMatchups,
      position: 'right',
      height: (matchUpHeight * 2.5),
      heightRatio: 4,
    },
    // Round 4
    {
      yStart: 55 + (matchUpHeight * 3),
      color: bracketColor,
      lineStartX: 640,
      lineEndX: 900,
      groupA: state.bracket.group1.round4.roundMatchups,
      groupB: state.bracket.group2.round4.roundMatchups,
      position: 'left',
      height: (matchUpHeight * 5),
      heightRatio: 8,
      fontSize: 60,
      songHeight: 100,
    },
    {
      yStart: 55 + (matchUpHeight * 3),
      color: bracketColor,
      lineStartX: width - 640,
      lineEndX: width - 900,
      groupA: state.bracket.group3.round4.roundMatchups,
      groupB: state.bracket.group4.round4.roundMatchups,
      position: 'right',
      height: (matchUpHeight * 5),
      heightRatio: 8,
      fontSize: 60,
      songHeight: 100,
    },
  ];

  for (let i = 0; i < rounds.length; i += 1) {
    round(
      offScreenCanvas,
      rounds[i].yStart,
      bracketColor,
      rounds[i].lineStartX,
      rounds[i].lineEndX,
      rounds[i].groupA,
      rounds[i].groupB,
      rounds[i].position,
      rounds[i].height,
      rounds[i].heightRatio,
      rounds[i].fontSize,
      rounds[i].songHeight,
    );
  }

  // Round 5 (Final 4)

  bracketContent(
    offScreenCanvas,
    55 + (matchUpHeight * 6),
    state.championshipBracket.round5.roundMatchups,
    0,
    900,
    1300,
    bracketColor,
    'left',
    matchUpHeight * 10,
    68,
    140
  );

  bracketContent(
    offScreenCanvas,
    55 + (matchUpHeight * 6),
    state.championshipBracket.round5.roundMatchups,
    1,
    width - 900,
    width - 1300,
    bracketColor,
    'right',
    matchUpHeight * 10,
    68,
    100
  );

  // Final Two
  const champion = state.championshipBracket.round5.roundMatchups;

  bracketContentSong(
    offScreenCanvas,
    canvasHeight - (canvasHeight * 0.05),
    600,
    600,
    champion[0].attributes.winner.attributes.artwork.bgColor, // background color
    champion[0].attributes.winner.attributes.name, // Song Name
    champion[0].attributes.winner.attributes.artwork.textColor2, // Text Color
    'left',
    68, // Font Size
    100, // Height of Rectangle
  );

  bracketContentSong(
    offScreenCanvas,
    canvasHeight - (canvasHeight * 0.05),
    width - 600,
    width - 600,
    champion[1].attributes.winner.attributes.artwork.bgColor,
    champion[1].attributes.winner.attributes.name,
    champion[1].attributes.winner.attributes.artwork.textColor2,
    'right',
    68,
    100,
  );

  // Winner
  bracketContentSong(
    offScreenCanvas,
    1000,
    (width / 2) + 400,
    3000,
    state.champion.song.attributes.artwork.textColor3,
    state.champion.song.attributes.name,
    state.champion.song.attributes.artwork.bgColor,
    'right',
    70,
    100,
  );

  placeImage(offScreenCanvas, image);
}
