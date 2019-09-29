import { Coordinate } from "./coordinate.mjs";

export class Puzzle {
  constructor(puzzle, desiredResult) {
    this.puzzle = puzzle;
    this.desiredResult = desiredResult;

    console.info("desired result");
    console.info(this.desiredResult);
  }

  get width() {
    return this.puzzle[0].length;
  }

  get hight() {
    return this.puzzle.length;
  }

  /**
   * @return Coordinate
   */
  findNextUnsorted() {
    const puzzleFlat = this.puzzle.flatMap(row => row);
    const desiredPuzzleFlat = this.desiredResult.flatMap(row => row);

    const number = desiredPuzzleFlat.find((n, i) => puzzleFlat[i] != n);
    const nextUnordered = this.getCoordinate(number);

    console.info("start", nextUnordered);
    return nextUnordered;
  }

  /**
   *
   * @param number
   * @return Coordinate
   */
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
   *
   * @param startCoordinate
   * @return Coordinate[]
   */
  getPathToTarget(startCoordinate) {
    const targetCoordinate = this.getCoordinate(
      startCoordinate.number,
      this.desiredResult
    );
    return this.getPathTo(startCoordinate, targetCoordinate);
  }

  /**
   *
   * @param startCoordinate
   * @param targetCoordinate
   * @return Coordinate[]
   */
  getPathTo(startCoordinate, targetCoordinate, avoidCoordinate) {
    // TODO build in coordinate avoidance
    const d = startCoordinate.minus(targetCoordinate);
    const path = [];
    let lastCoordinate = startCoordinate;

    while (!targetCoordinate.equals(lastCoordinate)) {
      const xCandidate =
        d.deltaX > 0 ? lastCoordinate.x - 1 : lastCoordinate.x + 1;
      const xCandidateCoordinate = new Coordinate(xCandidate, lastCoordinate.y);
      const yCandidate =
        d.deltaY > 0 ? lastCoordinate.y - 1 : lastCoordinate.y + 1;
      const yCandidateCoordinate = new Coordinate(lastCoordinate.x, yCandidate);

      if (d.deltaX == 0 && d.deltaY == 0) {
        path.push(targetCoordinate);
      } else if (
        Math.abs(d.deltaX) > Math.abs(d.deltaY) &&
        !xCandidateCoordinate.equals(avoidCoordinate)
      ) {
        path.push(xCandidateCoordinate);
        d.deltaX > 0 ? d.deltaX-- : d.deltaX++;
      } else if (!yCandidateCoordinate.equals(avoidCoordinate)) {
        path.push(yCandidateCoordinate);
        d.deltaY > 0 ? d.deltaY-- : d.deltaY++;
      } else {
        path.push(xCandidateCoordinate);
        d.deltaX > 0 ? d.deltaX-- : d.deltaX++;
      }

      lastCoordinate = path[path.length - 1];
    }

    return path;
  }

  sortOne(startCoordinate) {
    const path = this.getPathToTarget(startCoordinate);
    console.info("path to target", path);
    let nextCoordinate = path.shift();

    while (nextCoordinate) {
      // move zero to swap position
      this._moveZero(nextCoordinate, startCoordinate);
      this._swap(nextCoordinate, startCoordinate);
      startCoordinate = nextCoordinate;
      nextCoordinate = path.shift();
    }

    console.info("after one sorted", this.puzzle);
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
  }
}
