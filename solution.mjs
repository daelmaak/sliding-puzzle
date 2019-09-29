import { Puzzle } from "./puzzle.mjs";
import { Coordinate } from "./coordinate.mjs";

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

function solvePuzzle(originalPuzzle) {
  let desiredResult = getDesiredResult(originalPuzzle);
  let puzzle = new Puzzle(originalPuzzle, desiredResult);

  let nextUnordered = puzzle.findNextUnsorted();
  let nextTarget = puzzle.getCoordinate(
    nextUnordered.number,
    puzzle.desiredResult
  );
  let coordinatesToAvoid = [];

  while (!isInCorner(puzzle, nextTarget)) {
    puzzle.sortOne(nextUnordered);
    nextUnordered = puzzle.findNextUnsorted();
    nextTarget = puzzle.getCoordinate(
      nextUnordered.number,
      puzzle.desiredResult
    );
  }

  // in the corner now - horizontal
  coordinatesToAvoid = puzzle.getCoordinates(0, 1, 0, puzzle.width - 2);

  nextTarget.x++;
  puzzle.sortOne(nextUnordered, nextTarget, coordinatesToAvoid);
  coordinatesToAvoid.push(nextTarget.copy());
  nextUnordered = puzzle.getCoordinate(nextUnordered.number + 1);
  nextTarget.y++;
  puzzle.sortOne(nextUnordered, nextTarget, coordinatesToAvoid);
  // and now rotate to final position
  nextUnordered = puzzle.findNextUnsorted();
  puzzle.sortOne(nextUnordered);
  nextUnordered = puzzle.findNextUnsorted();
  puzzle.sortOne(nextUnordered);
  //horizontal DONE!!

  //*************************** VERTICAL ****************************/
  coordinatesToAvoid = [];
  desiredResult = getDesiredResult(originalPuzzle, 0, 1);
  puzzle = new Puzzle(originalPuzzle.slice(1), desiredResult);

  nextUnordered = puzzle.findNextUnsorted();
  nextTarget = puzzle.getCoordinate(nextUnordered.number, puzzle.desiredResult);

  while (!isInCorner(puzzle, nextTarget)) {
    puzzle.sortOne(nextUnordered, null, coordinatesToAvoid);
    coordinatesToAvoid.push(nextTarget);
    nextUnordered = puzzle.findNextUnsorted();
    nextTarget = puzzle.getCoordinate(
      nextUnordered.number,
      puzzle.desiredResult
    );
  }
}

function getDesiredResult(puzzle, xOffset, yOffset) {
  const rowCount = puzzle.length;
  const colCount = puzzle[0].length;

  let desiredResult = Array(rowCount)
    .fill(0)
    .map((_, rowIndex) => {
      var row = Array(colCount)
        .fill(0)
        .map((_, colIndex) => colIndex + 1 + colCount * rowIndex);
      return row;
    });
  desiredResult[rowCount - 1][colCount - 1] = 0;

  if (yOffset) {
    desiredResult = desiredResult.slice(yOffset);
  }
  if (xOffset) {
    desiredResult = desiredResult.map(row => row.slice(xOffset));
  }

  return desiredResult;
}

function isInCorner(puzzle, coordinate) {
  return (
    puzzle.width - (coordinate.x + 1) < 2 ||
    puzzle.height - (coordinate.y + 1) < 2
  );
}
