import { Coordinate } from "./coordinate.mjs";

export class Puzzle {
  constructor(puzzle, desiredResult) {
    this.puzzle = puzzle;
    this.desiredResult = desiredResult;

    console.info("desired result");
    console.info(this.desiredResult);
  }

  /**
   * @return Coordinate
   */
  findNextUnordered() {
    const puzzleFlat = this.puzzle.flatMap(row => row);
    const desiredPuzzleFlat = this.desiredResult.flatMap(row => row);

    const number = desiredPuzzleFlat.find((n, i) => puzzleFlat[i] != n);
    return this.getCoordinate(number);
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
  getPathTo(startCoordinate, targetCoordinate) {
    // TODO build in coordinate avoidance
    const d = startCoordinate.minus(targetCoordinate);
    const path = [];
    let lastCoordinate = startCoordinate;

    while (!targetCoordinate.equals(lastCoordinate)) {
      const xCandidate =
        d.deltaX > 0 ? lastCoordinate.x - 1 : lastCoordinate.x + 1;
      const yCandidate =
        d.deltaY > 0 ? lastCoordinate.y - 1 : lastCoordinate.y + 1;

      if (d.deltaX == 0 && d.deltaY == 0) {
        path.push(targetCoordinate);
      } else if (Math.abs(d.deltaX) > Math.abs(d.deltaY)) {
        path.push(new Coordinate(xCandidate, lastCoordinate.y));
        d.deltaX > 0 ? d.deltaX-- : d.deltaX++;
      } else {
        path.push(new Coordinate(lastCoordinate.x, yCandidate));
        d.deltaY > 0 ? d.deltaY-- : d.deltaY++;
      }

      lastCoordinate = path[path.length - 1];
    }

    return path;
  }

  move(startCoordinate, path) {
    path = path.slice();
    let nextCoordinate = path.shift();

    this.moveZero(nextCoordinate);
  }

  moveZero(targetCoordinate) {
    const zeroCoordinate = this.getCoordinate(0);
    const pathToTarget = [zeroCoordinate].concat(
      this.getPathTo(zeroCoordinate, targetCoordinate)
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
