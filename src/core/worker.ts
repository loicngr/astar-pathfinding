import { WORKER_COMPUTE_PATH_KEY } from "../index.ts"
import { type WorkerPayload } from "../interfaces/worker.ts"
import { Grid } from "./grid.ts"
import { findPath } from "./aStar.ts"
import { GridConstruct } from "../interfaces/grid.ts"

function onMessage(e: MessageEvent<unknown>) {
  const payload: WorkerPayload = JSON.parse(e.data as string) as WorkerPayload

  switch (payload.key) {
    case WORKER_COMPUTE_PATH_KEY:
      const { grid : gridAsObject } = payload.data as { grid: GridConstruct }
      const grid = Grid.fromObj(gridAsObject)

      const path = findPath(
        grid,
        grid.startPos,
        grid.endPos
      )

      postMessage({
        key: WORKER_COMPUTE_PATH_KEY,
        data: path
      })
      break
    default:
      break
  }
}

onmessage = onMessage

