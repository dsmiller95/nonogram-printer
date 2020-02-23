import * as React from 'react';
import './App.css';

import Grid from './grid/Grid'
import Guide from './Guide/Guide';
import { Pixel } from './Pixel';
import { NonogramKey } from './models/nonogram-parameter';
import { generateKey } from './Guide/guide-number-generator';

interface State {
  grid: Pixel[][];
  gridKey: NonogramKey;
}

class App extends React.Component<object, State> {

  constructor(props: object){
    super(props);
    this.state = {
      grid: [],
      gridKey: {firstDimensionNumbers: [], secondDimensionNumbers: []}
    };
  }

  private gridChanged(grid: Pixel[][]){
    //const solutions = solveNonogram()
    const key = generateKey(grid.map(x => x.map(pixel => pixel.isBlack)));
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
        <Guide nonogramKey={this.state.gridKey}></Guide>
      </div>
    );
  }
}

export default App;
