# [Nonogram designer and solver](https://dsmiller95.github.io/nonogram-printer)

This project was created to design nonogram puzzles and print out guides for these puzzles; hosted here on GH pages: [Designer](https://dsmiller95.github.io/nonogram-printer)

If you can design a nonogram which the solver can't handle, please grab a screenshot and submit an issue in this repository

## Edit mode

While in edit mode, the sidebar will display a summary of some difficulty metrics of the puzzle based on an attempt to solve it. You'll be able to see how many solutions there are to the puzzle, and a summary of the number of guesses required to get to each solution. The summary updates will be debounced because sometimes the solver can take significant time and lock the UI; while the solver is working the difficulty rating numbers will show loading animations.

The difficulty rating is based off of how many steps it takes to reach each solution; on average

When a cell shows a slightly checkered background, that means that there are multiple solutions and that individual cell has different values in the resulting possible solutions.

The URL will update when you edit the puzzle, and if you share the full url then anyone else can use that to load the same puzzle that you designed!

## Solve mode

While in solve mode, step through the solver's solution one step at a time. Each step, the solver will do one of three things:
- Solve cells in a single row or column, if possible to gain any more information on that row/column
- Take a guess at an unknown cell. This happens when the solver cannot solve any of the rows or columns as they are
- Rewind to a previous state before a guess. This happens whenever all the solutions(possible none) for a certain guess have been found

## Algorithm overview

The overarching algorithm is as follows:
1. For each row and column, attempt to further solve each one. Repeat this process until no more cells in the grid change.
2. If there are any unknown cells left, make a guess: find the first unknown cell and set it to Unset/White
   1. After guessing, go back to step 1
   2. If any solutions were found based off the guess, add them to a list.
   3. Make the opposite guess: this will catch alternate solutions; or if there were no solutions for the original guess this will catch the first solutions
   4. Return all results from both guesses
3. Return the list of solutions found

To solve individual rows/columns (slices):
1. From the number key for the slice, construct all possible permutations of segments in that slice
2. Filter out any of the permutations which contradict any cells which already exist in the row
3. Reduce the permutations down:
   1. If the cell at a specific index is always Set or Unset, it will be reduced to that value
   2. Otherwise, it will be set to Unknown