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
    const d = startCoordinate.minus(targetCoordinate);
    const path = [];
    let lastCoordinate = startCoordinate;

    while (!targetCoordinate.equals(lastCoordinate)) {
      if (d.deltaX == 0 && d.deltaY == 0) {
        path.push(targetCoordinate);
      } else if (Math.abs(d.deltaX) > Math.abs(d.deltaY)) {
        path.push(
          new Coordinate(
            d.deltaX > 0 ? lastCoordinate.x - 1 : lastCoordinate.x + 1,
            lastCoordinate.y
          )
        );
        d.deltaX > 0 ? d.deltaX-- : d.deltaX++;
      } else {
        path.push(
          new Coordinate(
            lastCoordinate.x,
            d.deltaY > 0 ? lastCoordinate.y - 1 : lastCoordinate.y + 1
          )
        );
        d.deltaY > 0 ? d.deltaY-- : d.deltaY++;
      }
      lastCoordinate = path[path.length - 1];
    }

    return path;
  }

  moveAlong(startCoordinate, path) {
    const zero = this.getCoordinate(0);
  }
}
