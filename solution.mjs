import { Puzzle } from "./puzzle.mjs";
import { Coordinate } from "./coordinate.mjs";
import { puzzleGenerator } from "./puzzleGenerator.mjs";

let originalPuzzle;

let hanging = [
  [1, 40, 31, 14, 41, 60, 50, 42],
  [17, 28, 55, 34, 54, 48, 11, 49],
  [47, 43, 4, 58, 22, 15, 29, 7],
  [46, 0, 38, 9, 25, 12, 53, 63],
  [5, 37, 27, 8, 20, 3, 13, 44],
  [59, 52, 57, 30, 62, 23, 61, 33],
  [16, 19, 32, 21, 10, 18, 2, 45],
  [35, 56, 51, 36, 26, 6, 39, 24]
];
let testM = puzzleGenerator(8, 8);

console.info("input", testM);
console.info("output", slidePuzzle(testM));

function slidePuzzle(puzzleMatrix) {
  if (!originalPuzzle) originalPuzzle = puzzleMatrix;

  let desiredResult = getDesiredResult(puzzleMatrix);
  let puzzle = new Puzzle(puzzleMatrix, desiredResult);

  // final 2x2
  if (puzzle.width == 2 && puzzle.height == 2) {
    let nextUnordered = puzzle.findNextUnsorted();
    // checking for unsolvable matrices
    let counter = 0;

    while (nextUnordered && counter < 3) {
      puzzle.sortOne(nextUnordered);
      nextUnordered = puzzle.findNextUnsorted();
      counter++;
    }
    return counter >= 3 ? null : puzzle.resultMoves;
  }

  // non corner coordinates
  let nextUnordered = puzzle.findNextUnsorted();
  let nextTarget = puzzle.getCoordinate(
    nextUnordered.number,
    puzzle.desiredResult
  );
  let coosToAvoid = [];
  const horizontal = puzzle.width <= puzzle.height;

  while (!isInCorner(puzzle, nextTarget)) {
    puzzle.sortOne(nextUnordered, null, coosToAvoid);
    nextUnordered = puzzle.findNextUnsorted();
    nextTarget = puzzle.getCoordinate(
      nextUnordered.number,
      puzzle.desiredResult
    );
    coosToAvoid = horizontal
      ? puzzle.getCoordinates(0, 1, 0, nextTarget.x)
      : puzzle.getCoordinates(0, nextTarget.y, 0);
  }

  // in the corner now, so the 2x2 sub-matrix in the bottom right corner
  let cornerCandidate2 = puzzle.getCornerCoordinates(horizontal)[1];
  const cornerTargets = puzzle.getCornerTargets(horizontal);
  const bottomRightCoordinate = new Coordinate(
    puzzle.width - 1,
    puzzle.height - 1
  );
  // move second corner candidate to bottom right corner to avoid conflicts
  puzzle.sortOne(cornerCandidate2, bottomRightCoordinate, coosToAvoid);

  // move first corner candidate to position
  const cornerCandidate1 = puzzle.getCornerCoordinates(horizontal)[0];
  puzzle.sortOne(cornerCandidate1, cornerTargets[0], coosToAvoid);
  coosToAvoid.push(cornerTargets[0]);

  // move second corner candidate to position
  cornerCandidate2 = puzzle.getCornerCoordinates(horizontal)[1];
  puzzle.sortOne(cornerCandidate2, cornerTargets[1], coosToAvoid);

  // and now rotate the corner candidates until they fit in
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
