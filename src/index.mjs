import { slidePuzzle } from "./solution.mjs";
import { puzzleGenerator } from "./puzzleGenerator.mjs";

document.querySelector(".app .solve").addEventListener("click", e => {
  const puzzle = puzzleGenerator(4, 4);
  const solution = slidePuzzle(puzzle);

  console.log("puzzle:", puzzle);
  console.log("solution:", solution);
});
