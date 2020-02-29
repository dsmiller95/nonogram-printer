import { observer } from 'mobx-react';
import * as React from 'react';
import './App.css';
import Grid from './grid/Grid';
import Guide from './Guide/Guide';
import StatBlock from './StatBlock/StatBlock';
import { ObservableGridStateStore } from './stores/grid-store';

interface State {
  gridStore: ObservableGridStateStore;
}

@observer
class App extends React.Component<object, State> {
  
  constructor(props: object){
    super(props);
    this.state = {
      gridStore: new ObservableGridStateStore()
    };
    this.state.gridStore.instantiateGrid(16, 16);
  }

  public render() {
    return (
      <div className="App">
        <Grid gridStore={ this.state.gridStore }/>
        <StatBlock solutions={this.state.gridStore.solution.solutions}></StatBlock>
        <Guide nonogramKey={this.state.gridStore.gridKey}></Guide>
      </div>
    );
  }
}

export default App;
