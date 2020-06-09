import {
  createMuiTheme,
  darken,
  lighten,
  ThemeProvider,
} from "@material-ui/core";
import { observer } from "mobx-react";
import * as React from "react";
import "./App.css";
import GridSolverInfo from "./grid-solver-info/grid-solver-info";
import Grid from "./grid/Grid";
import Guide from "./Guide/Guide";
import { GridEditMode } from "./models/grid-edit-mode";
import StatBlock from "./StatBlock/StatBlock";
import { GridStore } from "./stores/grid-store/grid-store";
import { RootStore } from "./stores/root-store/root-store";
import { reaction } from "mobx";
import {
  serializeGrid,
  serializedKeys,
  attemptDeserializeGrid,
} from "./stores/grid-serializer";
import {
  setQueryParams,
  getQueryParams,
} from "./stores/window-query-param-accessor";
import { overwriteFavicon } from "./stores/window-favicon-manager";
import { Pixel, PixelState } from "./Pixel";

interface State {
  rootStore: RootStore;
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#706c61",
      light: lighten("#706c61", 0.2),
      dark: darken("#706c61", 0.2),
    },
    secondary: {
      main: "#e1f4f3",
      light: lighten("#e1f4f3", 0.2),
      dark: darken("#e1f4f3", 0.2),
    },
  },
});
@observer
class App extends React.Component<object, State> {
  constructor(props: object) {
    super(props);
    this.state = {
      rootStore: new RootStore(),
    };
    this.state.rootStore.editableGrid.instantiateGrid(
      App.generateGirdFromURLOrDefault()
    );
    this.setupGridQueryParamUpdater(this.state.rootStore.editableGrid);
  }

  private setupGridQueryParamUpdater(gridStore: GridStore) {
    // TODO: is this replcated in grid-solver-store?
    reaction(
      () => gridStore.gridStates,
      (grid, reaction) => {
        if (!grid) return;
        const pixelStates = grid.map((col) => col.map((pix) => pix));
        const serialized = serializeGrid(pixelStates);
        setQueryParams(serialized);
        overwriteFavicon(pixelStates);
      },
      {
        delay: 1000,
      }
    );
  }

  private static generateGirdFromURLOrDefault(): PixelState[][] {
    const queryGridData = getQueryParams(...serializedKeys);
    const deserialized = attemptDeserializeGrid(queryGridData);
    if (deserialized) {
      return deserialized;
    }
    const width = 16,
      height = 16;
    let grid: PixelState[][] = [];
    for (let i = 0; i < width; i++) {
      let col: PixelState[] = [];
      for (let j = 0; j < height; j++) {
        col.push(PixelState.White);
      }
      grid.push(col);
    }
    return grid;
  }

  public render() {
    const editableGridStore = this.state.rootStore.editableGrid;
    const gridSolverStore = this.state.rootStore.gridSolverStore;
    const uiStore = this.state.rootStore.uiStore;
    return (
      <ThemeProvider theme={theme}>
        <div className="App">
          <div className="sidePanel">
            <StatBlock
              gridSolverStore={gridSolverStore}
              uiStore={uiStore}
            ></StatBlock>
            <Guide nonogramKey={editableGridStore.gridKey}></Guide>
          </div>
          <div
            className={
              "gridPanel no-print" +
              (uiStore.mode === GridEditMode.EDIT
                ? " grid-panel-editing"
                : "") +
              (uiStore.mode === GridEditMode.SOLVE_COMPUTE
                ? " grid-panel-solving"
                : "")
            }
          >
            <GridSolverInfo
              gridSolverStore={gridSolverStore}
              uiStore={uiStore}
            ></GridSolverInfo>
            <div className="grid-container-padding">
              <Grid gridStore={editableGridStore} uiStore={uiStore} />
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
