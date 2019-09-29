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

  equals(coordinate) {
    if (!coordinate) return false;
    return coordinate.x == this.x && coordinate.y == this.y;
  }
}
