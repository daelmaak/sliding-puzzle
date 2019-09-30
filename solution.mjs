import { Puzzle } from "./puzzle.mjs";
import { Coordinate } from "./coordinate.mjs";

let originalPuzzle;
let testM = [
  [26, 63, 42, 1, 0, 55, 48, 54, 28],
  [58, 24, 20, 44, 2, 61, 10, 78, 53],
  [77, 15, 5, 50, 22, 67, 60, 76, 56],
  [65, 7, 73, 25, 80, 69, 74, 3, 29],
  [59, 11, 16, 6, 31, 17, 37, 43, 13],
  [35, 8, 66, 19, 30, 39, 34, 64, 57],
  [47, 52, 68, 4, 36, 41, 14, 79, 45],
  [18, 33, 40, 38, 70, 72, 21, 23, 32],
  [49, 62, 75, 27, 9, 51, 71, 12, 46]
];
testM = [[10, 3, 6, 4], [1, 5, 8, 0], [2, 13, 7, 15], [14, 9, 12, 11]];

console.log(slidePuzzle(testM));

function slidePuzzle(puzzleMatrix) {
  if (!originalPuzzle) originalPuzzle = puzzleMatrix;

  let desiredResult = getDesiredResult(puzzleMatrix);
  let puzzle = new Puzzle(puzzleMatrix, desiredResult);

  // final 2x2
  if (puzzle.width == 2 && puzzle.height == 2) {
    let nextUnordered = puzzle.findNextUnsorted();
    let counter = 0;

    while (nextUnordered && counter < 3) {
      puzzle.sortOne(nextUnordered);
      nextUnordered = puzzle.findNextUnsorted();
      counter++;
    }
    // TODO return results
    return counter >= 3 ? null : puzzle.resultMoves;
  }

  // non corner ones
  let nextUnordered = puzzle.findNextUnsorted();
  let nextTarget = puzzle.getCoordinate(
    nextUnordered.number,
    puzzle.desiredResult
  );
  let coosToAvoid = [];
  const horizontal = puzzle.width <= puzzle.height;

  while (!isInCorner(puzzle, nextTarget)) {
    puzzle.sortOne(nextUnordered, null, coosToAvoid);
    coosToAvoid.push(nextTarget);
    nextUnordered = puzzle.findNextUnsorted();
    nextTarget = puzzle.getCoordinate(
      nextUnordered.number,
      puzzle.desiredResult
    );
  }

  // in the corner now
  coosToAvoid = horizontal
    ? puzzle.getCoordinates(0, 1, 0, puzzle.width - 2)
    : puzzle.getCoordinates(0, puzzle.height - 2, 0, 1);

  let cornerCandidate2 = puzzle.getCornerCoordinates(horizontal)[1];
  const cornerTargets = puzzle.getCornerTargets(horizontal);
  const bottomRightCoordinate = new Coordinate(
    puzzle.width - 1,
    puzzle.height - 1
  );
  // move second candidate to bottom right corner to avoid conflicts
  puzzle.sortOne(cornerCandidate2, bottomRightCoordinate, coosToAvoid);
  // coosToAvoid.push(bottomRightCoordinate);

  // move first candidate to position
  const cornerCandidate1 = puzzle.getCornerCoordinates(horizontal)[0];
  puzzle.sortOne(cornerCandidate1, cornerTargets[0], coosToAvoid);
  coosToAvoid.push(cornerTargets[0]);
  // coosToAvoid.splice(coosToAvoid.indexOf(bottomRightCoordinate), 1);

  // move second candidate to position
  cornerCandidate2 = puzzle.getCornerCoordinates(horizontal)[1];
  puzzle.sortOne(cornerCandidate2, cornerTargets[1], coosToAvoid);

  // and now rotate the corner
  coosToAvoid = puzzle.getCornerTargets(horizontal);
  nextUnordered = puzzle.findNextUnsorted();
  puzzle.sortOne(nextUnordered, null, coosToAvoid);
  coosToAvoid = [];
  nextUnordered = puzzle.findNextUnsorted();
  puzzle.sortOne(nextUnordered, null, coosToAvoid);

  const subPuzzle = horizontal
    ? puzzleMatrix.slice(1)
    : puzzleMatrix.map(row => row.slice(1));

  const subResults = slidePuzzle(subPuzzle);

  return subResults ? puzzle.resultMoves.concat(subResults) : null;
}

function getDesiredResult(puzzle) {
  const rowCount = puzzle.length;
  const colCount = puzzle[0].length;

  const desiredResultFlat = puzzle
    .flatMap(row => row)
    .filter(n => n)
    .sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
  desiredResultFlat[desiredResultFlat.length] = 0;

  let desiredResult = [];

  for (let i = 0; i < rowCount * colCount; i = i + colCount) {
    desiredResult.push(desiredResultFlat.slice(i, i + colCount));
  }
  return desiredResult;
}

function isInCorner(puzzle, coordinate) {
  return (
    puzzle.width - (coordinate.x + 1) < 2 ||
    puzzle.height - (coordinate.y + 1) < 2
  );
}
