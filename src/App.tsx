import * as React from 'react';
import './App.css';

import Grid from './grid/Grid'
import Guide from './Guide/Guide';
import { Pixel } from './Pixel';
import { NonogramKey, NonogramSolution } from './models/nonogram-parameter';
import { generateKey } from './Guide/guide-number-generator';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { solveNonogram } from './nonogram-solver/nonogram-solve';
import StatBlock from './StatBlock/StatBlock';

interface State {
  grid: Pixel[][];
  gridKey: NonogramKey;
  solutions: NonogramSolution[];
}

class App extends React.Component<object, State> {
  private keyChangedSubject: Subject<NonogramKey>;
  
  constructor(props: object){
    super(props);
    this.state = {
      grid: [],
      gridKey: {firstDimensionNumbers: [], secondDimensionNumbers: []},
      solutions: []
    };
    this.keyChangedSubject = new Subject<NonogramKey>();
    this.keyChangedSubject.pipe(
      debounceTime(1000)
    ).subscribe(key => {
      console.log(key);
      const solved = solveNonogram(key);
      console.log(solved);
      this.setState({
        solutions: solved.solutions
      });
    })
  }

  private gridChanged(grid: Pixel[][]){
    const key = generateKey(grid.map(x => x.map(pixel => pixel.isBlack)));
    this.keyChangedSubject.next(key);
    this.setState({
      grid,
      gridKey: key
    });
  }

  public render() {
    return (
      <div className="App">
        <Grid width={16} height={16} onGridChanged={
          (grid: Pixel[][]) => {
            this.gridChanged(grid);
          }
        } />
        <StatBlock solutions={this.state.solutions}></StatBlock>
        <Guide nonogramKey={this.state.gridKey}></Guide>
      </div>
    );
  }
}

export default App;
