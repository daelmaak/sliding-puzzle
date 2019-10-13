<script>
	import Puzzle from './Puzzle.svelte';
	import { slidePuzzle } from "../backend/solution.mjs";
	import { puzzleGenerator } from "../backend/puzzleGenerator.mjs";

	let puzzle;
	let solution;
	let rows = 5;
	let cols = 5;
	let speed = 200;

	generatePuzzle();

	function generatePuzzle() {
		let p;
		// to remove the old puzzle from the DOM
		puzzle = null;
		solution = null;

		// generate solvable matrix
		while (!solution) {
			p = puzzleGenerator(+rows, +cols);
			solution = slidePuzzle(p);
		}

		// give time to svelte to remove the old puzzle, otherwise it would reuse DOM elements for the new puzzle
		// with the old CSS transforms
		setTimeout(() => puzzle = p);
	}
</script>

<style>
	.control-panel {
		display: flex;
		align-items: center;
	}
	label {
		margin-left: 30px;
	}
</style>

<div class="app">
	<div class="control-panel">
		<button on:click={generatePuzzle}>Generate</button>
		<label for="rows">Rows:
			<input type="text" id="rows" bind:value={rows}>
		</label>		
		<label for="cols">Columns:
		  <input type="text" id="cols" bind:value={cols}>
		</label>
	</div>
	<Puzzle {puzzle} {solution} {speed}/>
</div>
