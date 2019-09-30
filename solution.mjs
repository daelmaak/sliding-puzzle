import { Puzzle } from "./puzzle.mjs";
import { Coordinate } from "./coordinate.mjs";

let originalPuzzle;
const testM = [
  [21, 14, 22, 9, 15],
  [11, 1, 8, 12, 6],
  [13, 7, 17, 23, 16],
  [19, 3, 2, 5, 18],
  [20, 24, 4, 10, 0]
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

  let cornerCandidates;
  let cornerTargets;

  for (let i = 0; i < 2; i++) {
    cornerCandidates = puzzle.getCornerCoordinates(horizontal);
    cornerTargets = puzzle.getCornerTargets(horizontal);

    if (detectFuckUp(puzzle, horizontal)) {
      const planBTarget = new Coordinate(puzzle.width - 1, puzzle.height - 1);
      coosToAvoid = [];
      puzzle.sortOne(cornerCandidates[1], planBTarget, coosToAvoid);
      coosToAvoid = horizontal
        ? puzzle.getCoordinates(0, 1, 0, puzzle.width - 2)
        : puzzle.getCoordinates(0, puzzle.height - 2, 0, 1);

      for (let j = 0; j < 2; j++) {
        cornerCandidates = puzzle.getCornerCoordinates(horizontal);
        cornerTargets = puzzle.getCornerTargets(horizontal);
        puzzle.sortOne(cornerCandidates[j], cornerTargets[j], coosToAvoid);
        coosToAvoid.push(cornerTargets[j]);
      }
      break;
    }

    puzzle.sortOne(cornerCandidates[i], cornerTargets[i], coosToAvoid);
    coosToAvoid.push(cornerTargets[i]);
  }

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

function detectFuckUp(puzzle, horizontal) {
  if (!horizontal) {
    return (
      puzzle.desiredResult[puzzle.desiredResult.length - 2][0] ==
        puzzle.puzzle[puzzle.puzzle.length - 1][0] &&
      puzzle.desiredResult[puzzle.desiredResult.length - 1][0] ==
        puzzle.puzzle[puzzle.puzzle.length - 2][0]
    );
  }
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
