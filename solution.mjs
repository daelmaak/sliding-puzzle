import { Puzzle } from "./puzzle.mjs";
import { Coordinate } from "./coordinate.mjs";

let originalPuzzle;
const testM = [
  [25, 28, 5, 4, 9, 21],
  [12, 1, 14, 24, 7, 26],
  [11, 27, 15, 23, 16, 3],
  [2, 20, 13, 19, 6, 29],
  [10, 8, 18, 17, 22, 0]
];
console.log(solvePuzzle(testM));

function solvePuzzle(puzzleMatrix) {
  if (!originalPuzzle) originalPuzzle = puzzleMatrix;

  let desiredResult = getDesiredResult(puzzleMatrix);
  let puzzle = new Puzzle(puzzleMatrix, desiredResult);

  // final 2x2
  if (puzzle.width == 2 && puzzle.height == 2) {
    let nextUnordered = puzzle.findNextUnsorted();
    while (nextUnordered) {
      puzzle.sortOne(nextUnordered);
      nextUnordered = puzzle.findNextUnsorted();
    }
    // TODO return results
    return puzzle.resultMoves;
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

  return puzzle.resultMoves.concat(solvePuzzle(subPuzzle));
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
