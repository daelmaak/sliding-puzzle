import { Puzzle } from "./puzzle.mjs";

let originalPuzzle;
const testM = [
  [5, 3, 17, 20, 11],
  [21, 16, 10, 6, 1],
  [13, 24, 12, 15, 18],
  [14, 22, 9, 2, 19],
  [7, 8, 23, 4, 0]
];

solvePuzzle(testM);

function solvePuzzle(puzzleMatrix) {
  if (!originalPuzzle) originalPuzzle = puzzleMatrix;

  if (puzzleMatrix.width == 2 && puzzleMatrix.height == 2) return;

  let desiredResult = getDesiredResult(puzzleMatrix);
  let puzzle = new Puzzle(puzzleMatrix, desiredResult);

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

  const lastPlacedCoordinate = coosToAvoid[coosToAvoid.length - 1];
  nextUnordered = lastPlacedCoordinate
    ? puzzle.getCoordinate(
        lastPlacedCoordinate.number +
          (horizontal ? 1 : originalPuzzle[0].length)
      )
    : nextUnordered;
  nextTarget = puzzle.getCoordinate(nextUnordered.number, puzzle.desiredResult);
  nextTarget[horizontal ? "x" : "y"]++;

  puzzle.sortOne(nextUnordered, nextTarget, coosToAvoid);
  coosToAvoid.push(nextTarget.copy());
  nextUnordered = puzzle.getCoordinate(
    nextUnordered.number + (horizontal ? 1 : originalPuzzle[0].length)
  );
  nextTarget[horizontal ? "y" : "x"]++;
  puzzle.sortOne(nextUnordered, nextTarget, coosToAvoid);
  // and now rotate to final position
  nextUnordered = puzzle.findNextUnsorted();
  puzzle.sortOne(nextUnordered);
  nextUnordered = puzzle.findNextUnsorted();
  puzzle.sortOne(nextUnordered);

  const subPuzzle = horizontal
    ? puzzleMatrix.slice(1)
    : puzzleMatrix.map(row => row.slice(1));
  const subPuzzles = solvePuzzle(subPuzzle);
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
