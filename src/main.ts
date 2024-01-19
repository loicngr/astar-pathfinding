import './style.css'
import { Grid } from "./core/grid.ts"
import { Canvas } from "./core/canvas.ts"
import { Loop } from "./core/loop.ts"
import { Api } from "./core/api.ts"
import {findPath} from "./core/aStar.ts";

export class App {
  grid: Grid
  canvas: Canvas
  loop: Loop
  api: Api

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

  private init(): void {
    console.log('game init')
  }

  private update(_interval: number): void {
    // console.log('game update')
  }

  private render(_delta: number): void {
    this.api.clearScreen(2)
    this.api.map(0, 0, 0, 0, 16, 16)

    const path = findPath(
      app,
      app.grid.startPos,
      app.grid.endPos
    )

    // draw path
    path.forEach((p) => {
      this.api.drawTileRec(
        14,
        16,
        16,
        p.x,
        p.y
      )
    })

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
