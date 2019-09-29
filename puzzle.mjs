import { Coordinate } from "./coordinate.mjs";

export class Puzzle {
  constructor(puzzle, desiredResult) {
    this.puzzle = puzzle;
    this.desiredResult = desiredResult;
    this.width = this.puzzle[0].length;
    this.height = this.puzzle.length;

    this.resultMoves = [];

    console.info("desired result");
    console.info(this.desiredResult);
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
   * @param rowStart
   * @param rowEnd
   * @param colStart
   * @param colEnd
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
      let xCandidateCoordinate = new Coordinate(xCandidate, lastCoordinate.y);
      const yCandidate =
        d.deltaY > 0 ? lastCoordinate.y - 1 : lastCoordinate.y + 1;
      let yCandidateCoordinate = new Coordinate(lastCoordinate.x, yCandidate);

      if (d.deltaX == 0 && d.deltaY == 0) {
        path.push(targetCoordinate);
      } else if (
        Math.abs(d.deltaX) > Math.abs(d.deltaY) &&
        !xCandidateCoordinate.isIn(avoidCoordinate)
      ) {
        path.push(xCandidateCoordinate);
        d.deltaX > 0 ? d.deltaX-- : d.deltaX++;
      } else if (!yCandidateCoordinate.isIn(avoidCoordinate)) {
        path.push(yCandidateCoordinate);
        d.deltaY > 0 ? d.deltaY-- : d.deltaY++;
      } else if (!xCandidateCoordinate.isIn(avoidCoordinate)) {
        path.push(xCandidateCoordinate);
        d.deltaX > 0 ? d.deltaX-- : d.deltaX++;
      } else {
        // no progress forward possible, back off!
        avoidCoordinate.push(lastCoordinate);

        let xDelta = xCandidate > lastCoordinate.x ? -1 : 1;
        xCandidateCoordinate = new Coordinate(
          lastCoordinate.x + xDelta,
          lastCoordinate.y
        );
        // back off horizontally
        if (
          xCandidateCoordinate.x >= 0 &&
          !xCandidateCoordinate.isIn(avoidCoordinate)
        ) {
          path.push(xCandidateCoordinate);
          d.deltaX <= 0 ? d.deltaX-- : d.deltaX++;
        } else {
          // back off vertically
          let yDelta = yCandidate > lastCoordinate.y ? -1 : 1;
          yCandidateCoordinate = new Coordinate(
            lastCoordinate.x,
            lastCoordinate.y + yDelta
          );
          path.push(yCandidateCoordinate);
          d.deltaY <= 0 ? d.deltaY-- : d.deltaY++;
        }
      }

      lastCoordinate = path[path.length - 1];
    }

    return path;
  }

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

    const number1 = this.getNumber(coordinate1);
    const number2 = this.getNumber(coordinate2);
    this.resultMoves.push(number1 || number2);
  }
}
