import type {Grid} from "../core/grid.ts";

export interface WorkerPayload {
  key: string,
  data: unknown
}

export interface WorkerPayloadComputePath {
  appGrid: Grid
  startPos: { x: number, y: number }
  endPos: { x: number, y: number }
}
