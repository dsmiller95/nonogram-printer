import { createMuiTheme, darken, lighten, ThemeProvider } from '@material-ui/core';
import { observer } from 'mobx-react';
import * as React from 'react';
import './App.css';
import GridSolverInfo from './grid-solver-info/grid-solver-info';
import Grid from './grid/Grid';
import Guide from './Guide/Guide';
import { GridEditMode } from './models/grid-edit-mode';
import StatBlock from './StatBlock/StatBlock';
import { GridStore } from './stores/grid-store/grid-store';
import { RootStore } from './stores/root-store/root-store';

interface State {
  rootStore: RootStore;
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#706c61',
      light: lighten('#706c61', 0.2),
      dark: darken('#706c61', 0.2),
    },
    secondary: {
      main: '#e1f4f3',
      light: lighten('#e1f4f3', 0.2),
      dark: darken('#e1f4f3', 0.2),
    },
  },
})
@observer
class App extends React.Component<object, State> {
  constructor(props: object){
    super(props);
    this.state = {
      rootStore: new RootStore()
    };
    this.state.rootStore.gridStore.instantiateGrid(16, 16);
  }

  public render() {
    const gridStore = this.state.rootStore.gridStore;
    const uiStore = this.state.rootStore.uiStore;
    return (
      <ThemeProvider theme={theme}>
        <div className="App">
          <div className="sidePanel">
            <StatBlock gridStore={gridStore} uiStore={ uiStore }></StatBlock>
            <Guide nonogramKey={gridStore.gridKey}></Guide>
          </div>
          <div 
            className={"gridPanel no-print" + 
              (uiStore.mode === GridEditMode.EDIT ? " grid-panel-editing" : "") +
              (uiStore.mode === GridEditMode.SOLVE ? " grid-panel-solving" : "")}
          >
            <GridSolverInfo gridStore={ gridStore } uiStore={ uiStore }></GridSolverInfo>
            <div className="grid-container-padding">
              <Grid gridStore={ gridStore } uiStore={ uiStore }/>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
