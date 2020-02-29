import { observer } from 'mobx-react';
import * as React from 'react';
import './App.css';
import GridSolverInfo from './grid-solver-info/grid-solver-info';
import Grid from './grid/Grid';
import Guide from './Guide/Guide';
import { GridEditMode } from './models/grid-edit-mode';
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
        <div className="sidePanel">
          <StatBlock gridStore={this.state.gridStore}></StatBlock>
          <Guide nonogramKey={this.state.gridStore.gridKey}></Guide>
        </div>
        <div 
          className={"gridPanel" + 
            (this.state.gridStore.mode === GridEditMode.EDIT ? " grid-panel-editing" : "") +
            (this.state.gridStore.mode === GridEditMode.SOLVE ? " grid-panel-solving" : "")}
        >
          <GridSolverInfo gridStore={ this.state.gridStore }></GridSolverInfo>
          <div className="grid-container-padding">
            <Grid gridStore={ this.state.gridStore }/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
