import { Coordinate } from "./coordinate.mjs";

export class Puzzle {
  constructor(puzzle, desiredResult) {
    this.puzzle = puzzle;
    this.desiredResult = desiredResult;
    this.width = this.puzzle[0].length;
    this.height = this.puzzle.length;

    this.resultMoves = [];
  }

  /**
   * @return Coordinate
   */
  findNextUnsorted() {
    let puzzleFlat;
    let desiredPuzzleFlat;

    if (this.height >= this.width) {
      puzzleFlat = this.puzzle.flatMap(row => row);
      desiredPuzzleFlat = this.desiredResult.flatMap(row => row);
    } else {
      puzzleFlat = [];
      desiredPuzzleFlat = [];

      // rotating the puzzle by 90deg
      for (let i = 0; i < this.width; i++) {
        puzzleFlat.push(...this.puzzle.map(row => row[i]));
        desiredPuzzleFlat.push(...this.desiredResult.map(row => row[i]));
      }
    }

    const number = desiredPuzzleFlat.find((n, i) => puzzleFlat[i] != n);
    const nextUnordered = this.getCoordinate(number);

    return nextUnordered;
  }

  /**
   * Get coordinates of those numbers whose target coordinates is the
   * first horizontal or vertical part of the 2x2 submatrix in the bottom right corner
   * @param horizontal
   * @return Coordinate[]
   */
  getCornerCoordinates(horizontal = true) {
    const cornerNumbers = horizontal
      ? this.desiredResult[0].slice(-2)
      : this.desiredResult.slice(-2).map(row => row[0]);

    return cornerNumbers.map(n => this.getCoordinate(n));
  }

  /**
   * Get coordinates of the first horizontal or vertical part of the 2x2 submatrix in the bottom right corner
   * @param horizontal
   */
  getCornerTargets(horizontal = true) {
    const targetCoordinates = this.getCornerCoordinates(horizontal).map(c =>
      this.getCoordinate(c.number, this.desiredResult)
    );

    if (horizontal) {
      targetCoordinates[0].x++;
      targetCoordinates[1].y++;
    } else {
      targetCoordinates[0].y++;
      targetCoordinates[1].x++;
    }

    return targetCoordinates;
  }

  getCoordinate(number, puzzle = this.puzzle) {
    let colIndex;
    let rowIndex;
    for (let row of puzzle) {
      if ((colIndex = row.indexOf(number)) > -1) {
        rowIndex = puzzle.indexOf(row);
        return new Coordinate(colIndex, rowIndex, number);
      }
    }
  }

  /**
   * Get flattened coordinates of the given area
   * @param rowStart - inclusive
   * @param rowEnd - exclusive
   * @param colStart - inclusive
   * @param colEnd - exclusive
   * @return Coordinate[]
   */
  getCoordinates(
    rowStart,
    rowEnd = rowStart + 1,
    colStart,
    colEnd = colStart + 1
  ) {
    return this.puzzle
      .slice(rowStart, rowEnd)
      .flatMap(row =>
        row.slice(colStart, colEnd).map(n => this.getCoordinate(n))
      );
  }

  getNumber(coordinate) {
    return this.puzzle[coordinate.y][coordinate.x];
  }

  /**
   * @return Coordinate[]
   */
  getPathTo(startCoordinate, targetCoordinate, avoidCoordinate) {
    const path = [];
    let lastCoordinate = startCoordinate;

    while (!targetCoordinate.equals(lastCoordinate)) {
      const { deltaX, deltaY } = lastCoordinate.minus(targetCoordinate);

      // proposed coordinate with x-axis change
      let xCandidate = deltaX > 0 ? lastCoordinate.x - 1 : lastCoordinate.x + 1;
      xCandidate = this.width <= xCandidate ? xCandidate - 2 : xCandidate;
      let xCandidateCoordinate = new Coordinate(xCandidate, lastCoordinate.y);

      // proposed coordinate with y-axis change
      let yCandidate = deltaY > 0 ? lastCoordinate.y - 1 : lastCoordinate.y + 1;
      yCandidate = this.height <= yCandidate ? yCandidate - 2 : yCandidate;
      let yCandidateCoordinate = new Coordinate(lastCoordinate.x, yCandidate);

      if (deltaX == 0 && deltaY == 0) {
        path.push(targetCoordinate);
      } else if (
        // close in on the further axis first in case there is no conflict
        Math.abs(deltaX) > Math.abs(deltaY) &&
        !xCandidateCoordinate.isIn(avoidCoordinate)
      ) {
        path.push(xCandidateCoordinate);
      } else if (!yCandidateCoordinate.isIn(avoidCoordinate)) {
        // if y candidate doesn't mean collision
        path.push(yCandidateCoordinate);
      } else if (!xCandidateCoordinate.isIn(avoidCoordinate)) {
        // if x candidate doesn't mean collision
        path.push(xCandidateCoordinate);
      } else {
        // no progress forward possible due to collisions, back off and mark current coordinate as to be avoided
        avoidCoordinate.push(lastCoordinate);

        let xDelta = xCandidate > lastCoordinate.x ? -1 : 1;
        let xBackOffCoordinate = new Coordinate(
          lastCoordinate.x + xDelta,
          lastCoordinate.y
        );

        if (
          // back off horizontally
          xBackOffCoordinate.x >= 0 &&
          !xBackOffCoordinate.isIn(avoidCoordinate) &&
          targetCoordinate.y != 0
        ) {
          path.push(xBackOffCoordinate);
        } else {
          // back off vertically
          let yDelta = yCandidate > lastCoordinate.y ? -1 : 1;
          let yBackOffCoordinate = new Coordinate(
            lastCoordinate.x,
            lastCoordinate.y + yDelta
          );
          path.push(yBackOffCoordinate);
        }
      }

      lastCoordinate = path[path.length - 1];
    }

    return path;
  }

  /**
   * @param startCoordinate
   * @param targetCoordinate - optional
   * @param avoidCoordinates - optional
   */
  sortOne(startCoordinate, targetCoordinate, avoidCoordinates = []) {
    targetCoordinate =
      targetCoordinate ||
      this.getCoordinate(startCoordinate.number, this.desiredResult);
    const path = this.getPathTo(
      startCoordinate,
      targetCoordinate,
      avoidCoordinates
    );
    let nextCoordinate = path.shift();

    while (nextCoordinate) {
      // move zero to swap position
      this._moveZero(nextCoordinate, avoidCoordinates.concat(startCoordinate));
      this._swap(nextCoordinate, startCoordinate);
      startCoordinate = nextCoordinate;
      nextCoordinate = path.shift();
    }
  }

  _moveZero(targetCoordinate, avoidCoordinate) {
    const zeroCoordinate = this.getCoordinate(0);
    const pathToTarget = [zeroCoordinate].concat(
      this.getPathTo(zeroCoordinate, targetCoordinate, avoidCoordinate)
    );

    for (let i = 0; i < pathToTarget.length - 1; i++) {
      this._swap(pathToTarget[i], pathToTarget[i + 1]);
    }
  }

  _swap(coordinate1, coordinate2) {
    let temp = this.puzzle[coordinate1.y][coordinate1.x];
    this.puzzle[coordinate1.y][coordinate1.x] = this.puzzle[coordinate2.y][
      coordinate2.x
    ];
    this.puzzle[coordinate2.y][coordinate2.x] = temp;

    const number1 = this.getNumber(coordinate1);
    const number2 = this.getNumber(coordinate2);
    this.resultMoves.push(number1 || number2);
  }
}
