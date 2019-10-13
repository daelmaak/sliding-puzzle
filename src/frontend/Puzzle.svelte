<script>
  import { Puzzle } from '../backend/puzzle.mjs';

  export let puzzle;
  export let solution;

  let cellWidth;
  let cellHeight;
  let solutionInterval;
  let puzzleEl;
  let solved = false;

  $: if (puzzle && puzzleEl) {
    solved = false;

    puzzleEl.style.setProperty('--rows', puzzle.length);
    puzzleEl.style.setProperty('--cols', puzzle[0].length);

    const style = getComputedStyle(puzzleEl);
    cellWidth = parseInt(style.getPropertyValue('--cell-width'));
    cellHeight = parseInt(style.getPropertyValue('--cell-height'));

    const startX = 300;
    const startY = 0;

    puzzle.forEach((row, i) => {
      row.forEach((cell, j) => {
        let number = j + 1 + i * puzzle[0].length;
        // last number is zero
        number = i == puzzle.length - 1 && j == puzzle[0].length - 1 ? 0 : number;

        const cellEl = puzzleEl.querySelector(`[data-number="${number}"]`);

        cellEl.style.setProperty('background-position', `-${startX + cellWidth * j}px -${startY + cellHeight * i}px`);
      });
    });
  }

  function solve() {
    const p = new Puzzle(puzzle);
    const s = solution.slice();
    const animationTime = getComputedStyle(puzzleEl)
        .getPropertyValue('--animation-time')
        .replace('s', '') * 1000;

    solutionInterval = setInterval(() => {
      const nextToSwap = s.shift();
      
      if (!nextToSwap) {
        solved = true;
        stop();
        return;
      } 

      const direction = p.swapWithZero(nextToSwap);

      _updatePositions(nextToSwap, direction);
    }, animationTime + 50)
  }

  function stop() {
    clearInterval(solutionInterval);
  }

  function _updatePositions(number, direction) {
    // TODO count not only on pixels here
    const xPattern = /translateX\((-?\d+)px\)/;
    const yPattern = /translateY\((-?\d+)px\)/;

    const zeroCell = puzzleEl.querySelector('[data-number="0"]');
    const numberCell = puzzleEl.querySelector(`[data-number="${number}"]`);

    let zeroX = zeroCell.style.getPropertyValue('transform').match(xPattern);
    zeroX = zeroX ? +zeroX[1] : 0;
    let numberX = numberCell.style.getPropertyValue('transform').match(xPattern);
    numberX = numberX ? +numberX[1] : 0;
    let zeroY = zeroCell.style.getPropertyValue('transform').match(yPattern);
    zeroY = zeroY ? +zeroY[1] : 0;
    let numberY = numberCell.style.getPropertyValue('transform').match(yPattern);
    numberY = numberY ? +numberY[1] : 0;


    switch (direction) {
      case 'left':
        zeroX -= cellWidth;
        numberX += cellWidth;
        break;
      case 'right':
        zeroX += cellWidth;
        numberX -= cellWidth;
        break;
      case 'up':
        zeroY -= cellHeight;
        numberY += cellHeight;
        break;
      case 'down':
        zeroY += cellHeight;
        numberY -= cellHeight;
        break;
    }

    zeroCell.style.setProperty('transform', `translateX(${zeroX}px) translateY(${zeroY}px)`);
    numberCell.style.setProperty('transform', `translateX(${numberX}px) translateY(${numberY}px)`);
  }
</script>

<style>
  .puzzle {
    --cell-width: 170px;
    --cell-height: 120px;
    --animation-time: 0.2s;

    display: grid;
    grid-template-rows: repeat(var(--rows), var(--cell-height));
    grid-template-columns: repeat(var(--cols), var(--cell-width));
    
    width: calc(var(--cols) * var(--cell-width));
    margin: 0 auto;
    font-size: 2em;
  }

  .cell {
    width: 100%;
    height: 100%;
    text-align: center;
    line-height: var(--cell-height);
    border: 1px solid rgb(184, 184, 184);
    box-sizing: border-box;
    transition: transform var(--animation-time), color 1s, border 1s;

    color: white;
    background-image: url(/dog1.jpg);
    background-size: 1200px;

  }

  .cell.transparent {
    color: transparent;
    border: transparent;
  }
</style>

{#if puzzle}
  <button on:click={solve}>Solve</button>
  <button on:click={stop}>Stop</button>
  
  <div class="puzzle" bind:this={puzzleEl}>
    {#each puzzle as row}
      {#each row as number}
        <div class="cell" class:transparent={solved} data-number={number}>{number}</div>
      {/each}
    {/each}
  </div>
{/if}

