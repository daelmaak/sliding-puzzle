export class Coordinate {
  constructor(x, y, number) {
    this.x = x;
    this.y = y;
    this.number = number;
  }

  /**
   *
   * @param coordinate
   * @return object acting as delta
   */
  minus(coordinate) {
    return {
      deltaX: this.x - coordinate.x,
      deltaY: this.y - coordinate.y
    };
  }

  copy() {
    return new Coordinate(this.x, this.y, this.number);
  }

  equals(coordinate) {
    if (!coordinate) return false;
    return coordinate.x == this.x && coordinate.y == this.y;
  }

  isIn(coordinates) {
    if (!Array.isArray(coordinates)) return this.equals(coordinates);
    return coordinates.find(c => this.equals(c));
  }
}
