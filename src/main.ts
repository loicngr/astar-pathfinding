import './style.css'
import { Grid } from "./core/grid.ts"
import { Canvas } from "./core/canvas.ts"
import { Loop } from "./core/loop.ts"
import { Api } from "./core/api.ts"
import { Input } from "./core/input.ts"
import Worker from './core/worker.ts?worker'
import { WORKER_COMPUTE_PATH_KEY } from "./index.ts"
import { type WorkerPayload } from "./interfaces/worker.ts"

export class App {
  grid: Grid
  canvas: Canvas
  loop: Loop
  api: Api
  input: Input
  computedPath: {x: number, y: number}[] = []
  worker: Worker

  constructor() {
    this.grid = new Grid()
    this.canvas = new Canvas({
      name: 'app',
      fullscreen: true,
      width: 300,
      height: 300,
      scale: 3
    })

    this.worker =  new Worker()
    this.loop = new Loop()
    this.api = new Api({
      canvas: this.canvas.canvas,
      renderer: this.canvas.renderer,
      grid: this.grid,
      options: {
        scaleFactor: this.canvas.scaleFactor
      }
    })
    this.input = new Input()
  }

  onWorkerMessage(e: MessageEvent<unknown>) {
    const payload: WorkerPayload = e.data as WorkerPayload

    switch (payload.key) {
      case WORKER_COMPUTE_PATH_KEY:
        const path = payload.data as {x: number, y: number}[]
        this.computedPath = path
        break
      default:
        break
    }
  }

  postWorkerMessage(payload: Partial<WorkerPayload>) {
    this.worker.postMessage(JSON.stringify(payload))
  }

  start() {
    this.worker.onmessage = this.onWorkerMessage.bind(this)

    this.loop.on('init', () => {
      this.init()
    }, this)

    this.loop.on('update', (interval: number) => {
      this.update(interval)
    }, this)

    this.loop.on('render', (delta: number) => {
      this.render(delta)
    }, this)

    this.loop.start()
  }

  private init(): void {
    console.log('game init')
  }

  private update(_interval: number): void {
    if (
      this.input.justDown('ArrowDown') &&
      this.grid.isInGrid(this.grid.startPos.x, this.grid.startPos.y + 1) &&
      this.grid.isWalkableAt(this.grid.startPos.x, this.grid.startPos.y + 1)
    ) {
      this.grid.startPos.y += 1
    }

    if (
      this.input.justDown('ArrowUp') &&
      this.grid.isInGrid(this.grid.startPos.x, this.grid.startPos.y - 1) &&
      this.grid.isWalkableAt(this.grid.startPos.x, this.grid.startPos.y - 1)
    ) {
      this.grid.startPos.y -= 1
    }

    if (
      this.input.justDown('ArrowLeft') &&
      this.grid.isInGrid(this.grid.startPos.x - 1, this.grid.startPos.y) &&
      this.grid.isWalkableAt(this.grid.startPos.x - 1, this.grid.startPos.y)
    ) {
      this.grid.startPos.x -= 1
    }

    if (
      this.input.justDown('ArrowRight') &&
      this.grid.isInGrid(this.grid.startPos.x + 1, this.grid.startPos.y) &&
      this.grid.isWalkableAt(this.grid.startPos.x + 1, this.grid.startPos.y)
    ) {
      this.grid.startPos.x += 1
    }
  }

  private render(_delta: number): void {
    this.api.clearScreen(2)
    this.api.map(0, 0, 0, 0, 16, 16)

    if (app.grid.startPos.x !== app.grid.endPos.x || app.grid.startPos.y !== app.grid.endPos.y) {
      this.postWorkerMessage({
        key: WORKER_COMPUTE_PATH_KEY,
        data: {
          grid: app.grid,
        }
      })

      // draw path
      this.computedPath.forEach((p) => {
        this.api.drawTileRec(
          14,
          16,
          16,
          p.x,
          p.y
        )
      })
    }

    // startPos
    this.api.drawTileRec(
      3,
      16,
      16,
      app.grid.startPos.x,
      app.grid.startPos.y
    )

    // endPos
    this.api.drawTileRec(
      8,
      16,
      16,
      app.grid.endPos.x,
      app.grid.endPos.y
    )
  }
}

const app = new App()

app.grid.defineMatrix([
  [
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: false, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7}
  ],
  [
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: false, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7}
  ],
  [
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: false, colorIndex: 7},
    {walkable: false, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7}
  ],
  [
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: false, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7}
  ],
  [
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7}
  ],
  [
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7}
  ],
  [
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7}
  ],
  [
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7},
    {walkable: true, colorIndex: 7}
  ]
])

app.grid.startPos = {
  x: 1,
  y: 0
}

app.grid.endPos = {
  x: 7,
  y: 2
}

window._ctx = app

app.start()
