<script>
	import Puzzle from './Puzzle.svelte';
	import { slidePuzzle } from "../backend/solution.mjs";
	import { puzzleGenerator } from "../backend/puzzleGenerator.mjs";

	let puzzle;
	let solution;

	generatePuzzle();

	function generatePuzzle() {
		let p;
		puzzle = null;
		solution = null;

		while (!solution) {
			p = puzzleGenerator(5,5);
			solution = slidePuzzle(p);
		}

		setTimeout(() => puzzle = p);
	}
</script>

<style>
	.app {
		width: calc(100% - 40px);
		margin: 0 auto;
	}
</style>

<div class="app">
	<button on:click={generatePuzzle}>Generate</button>
	<Puzzle {puzzle} {solution} />
</div>
