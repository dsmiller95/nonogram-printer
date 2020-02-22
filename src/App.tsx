import * as React from 'react';
import './App.css';

import Grid from './grid/Grid'
import Guide from './Guide/Guide';
import { Pixel } from './Pixel';

interface State {
  grid: Pixel[][];
}

class App extends React.Component<object, State> {

  constructor(props: object){
    super(props);
    this.state = {
      grid: []
    };
  }

  public render() {
    return (
      <div className="App">
        <Grid width={16} height={16} onGridChanged={
          (grid: Pixel[][]) => {
            this.setState({grid});
          }
        } />
        <Guide grid={this.state.grid}></Guide>
      </div>
    );
  }
}

export default App;
