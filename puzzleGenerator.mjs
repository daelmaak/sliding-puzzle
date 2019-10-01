export function puzzleGenerator(width = 3, height = 3) {
  const amount = width * height;

  const numbers = Array(amount)
    .fill(0)
    .map((_, i) => i);

  const puzzleFlat = [];

  for (let i = 0; i < amount; i++) {
    const nextNumber = numbers[Math.floor(Math.random() * numbers.length)];
    puzzleFlat.push(nextNumber);
    numbers.splice(numbers.indexOf(nextNumber), 1);
  }

  const puzzle = [];

  for (let i = 0; i < amount; i = i + width) {
    puzzle.push(puzzleFlat.slice(i, i + width));
  }

  return puzzle;
}
