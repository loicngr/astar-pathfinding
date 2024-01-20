import './style.css'
import { Grid } from "./core/grid.ts"
import { Canvas } from "./core/canvas.ts"
import { Loop } from "./core/loop.ts"
import { Api } from "./core/api.ts"
import { findPath } from "./core/aStar.ts"
import { Input } from "./core/input.ts"
import throttle from 'lodash/fp/throttle'

interface ThrottleFn<T extends () => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined
}

export class App {
  grid: Grid
  canvas: Canvas
  loop: Loop
  api: Api
  input: Input
  computedPath: {x: number, y: number}[] = []
  throttlePathCompute?: ThrottleFn<() => void>

  constructor() {
    this.grid = new Grid()
    this.canvas = new Canvas({
      name: 'app',
      fullscreen: true,
      width: 300,
      height: 300,
      scale: 3
    })

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

  start() {
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

  private computePath() {
    // if (!this.input.justDown('Space')) {
    //   return
    // }

    // No Heap (403.32 ms)
    // Heap (36.72 ms)
    // console.time('findPath')
    this.computedPath = findPath(
      app,
      app.grid.startPos,
      app.grid.endPos
    )
    // console.timeEnd('findPath')
  }

  private init(): void {
    console.log('game init')
    this.throttlePathCompute = throttle(500, this.computePath)
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
      if (typeof this.throttlePathCompute === 'function') {
        this.throttlePathCompute()
      }

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
app.grid.matrix = [
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
]

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
