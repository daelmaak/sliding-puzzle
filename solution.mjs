import { Puzzle } from "./puzzle.mjs";

const testM = [
  [5, 3, 17, 20, 11],
  [21, 16, 10, 6, 1],
  [13, 24, 12, 15, 18],
  [14, 22, 9, 2, 19],
  [7, 8, 23, 4, 0]
];

const desiredResult = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
  [21, 22, 23, 24, 0]
];

solvePuzzle(testM);

function solvePuzzle(puzzle) {
  const desiredResult = getDesiredResult(puzzle);
  puzzle = new Puzzle(puzzle, desiredResult);

  const nextUnordered = puzzle.findNextUnordered();
  console.info("start", nextUnordered);
  const pathToTarget = puzzle.getPathToTarget(nextUnordered);
  console.info("path to target", pathToTarget);
  puzzle.move(nextUnordered, pathToTarget);
  console.info("after zero moved", puzzle.puzzle);
}

function getDesiredResult(puzzle) {
  const rowCount = puzzle.length;
  const colCount = puzzle[0].length;

  const desiredResult = Array(rowCount)
    .fill(0)
    .map((_, rowIndex) => {
      var row = Array(colCount)
        .fill(0)
        .map((_, colIndex) => colIndex + 1 + colCount * rowIndex);
      return row;
    });
  desiredResult[rowCount - 1][colCount - 1] = 0;

  return desiredResult;
}
