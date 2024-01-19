import './style.css'
import EventEmitter from "eventemitter3"

interface IGameConfig {
  name: string
  scale: number
  width: number
  height: number
  fullscreen: boolean
}

interface ICanvasRenderer {
  canvas: HTMLCanvasElement
  renderer: CanvasRenderingContext2D
  grid: Grid
  options: {
    scaleFactor: number
  }
}

class Api {
  private readonly palette: string[]
  private mapAdjustments = {x: 0, y: 0}

  constructor(private context: ICanvasRenderer) {
    this.palette = [
      '#000000',
      '#1D2B53',
      '#7E2553',
      '#008751',
      '#AB5236',
      '#5F574F',
      '#C2C3C7',
      '#FFF1E8',
      '#FF004D',
      '#FFA300',
      '#FFEC27',
      '#00E436',
      '#29ADFF',
      '#83769C',
      '#FF77A8',
      '#FFCCAA',
    ]
  }

  public clearScreen(colorIndex?: number): void {
    const context = this.context.renderer

    if (colorIndex === undefined) {
      context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
    } else {
      context.fillStyle = this.palette[colorIndex]
      context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height)
    }
  }

  public widthInPixels(): number {
    return this.context.canvas.width / this.context.options.scaleFactor
  }

  public heightInPixels(): number {
    return this.context.canvas.height / this.context.options.scaleFactor
  }

  public drawPixel(x: number, y: number, colorIndex: number): void {
    this.context.renderer.fillStyle = this.palette[colorIndex]

    this.context.renderer.fillRect(
      x * this.context.options.scaleFactor,
      y * this.context.options.scaleFactor,
      this.context.options.scaleFactor,
      this.context.options.scaleFactor
    )
  }

  public drawRectOutline(x0: number, y0: number, w: number, h: number, colorIndex: number): void {
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
          this.drawPixel(x0 + x, y0 + y, colorIndex)
        }
      }
    }
  }

  public drawRect(x: number, y: number, w: number, h: number, colorIndex: number): void {
    this.context.renderer.fillStyle = this.palette[colorIndex]

    this.context.renderer.fillRect(
      x * this.context.options.scaleFactor,
      y * this.context.options.scaleFactor,
      w * this.context.options.scaleFactor,
      h * this.context.options.scaleFactor
    )

    this.drawRectOutline(x, y, w, h, 0)
  }

  public drawLine(from: { x: number, y: number }, to: { x: number, y: number }, c: number): void {
    from.x = Math.ceil(from.x)
    from.y = Math.ceil(from.y)
    to.x = Math.ceil(to.x)
    to.y = Math.ceil(to.y)
    let dx = Math.abs(to.x - from.x)
    let dy = Math.abs(to.y - from.y)
    let sx = from.x < to.x ? 1 : -1
    let sy = from.y < to.y ? 1 : -1
    let err = dx - dy

    for (let x = 0; x <= dx; x++) {
      for (let y = 0; y <= dy; y++) {
        this.drawPixel(from.x, from.y, c)
        if (from.x == to.x && from.y == to.y) {
          break
        }
        let e2 = 2 * err
        if (e2 >= -dy) {
          err -= dy
          from.x += sx
        }
        if (e2 < dx) {
          err += dx
          from.y += sy
        }
      }
    }
  }

  public map(
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    sx?: number,
    sy?: number
  ): void {
    let mapArray = this.context.grid.matrix
    let tileSize = this.context.grid.tileSize
    let numberVerticalTiles = this.context.grid.height
    let numberHorizontalTiles = this.context.grid.width
    let width = w || numberHorizontalTiles
    let height = h || numberVerticalTiles
    this.mapAdjustments.x = x || 0
    this.mapAdjustments.y = y || 0
    let x1 = sx || 0
    let y1 = sy || 0

    for (let y0 = this.mapAdjustments.y; y0 < height; y0++) {
      for (let x0 = this.mapAdjustments.x; x0 < width; x0++) {
        if (
          x0 === this.context.grid.startPos.x &&
          y0 === this.context.grid.startPos.y
        ) {
          this.drawTile(
            3,
            x1 + (x0 - this.mapAdjustments.x) * tileSize,
            y1 + (y0 - this.mapAdjustments.y) * tileSize
          )

          continue
        }

        if (
          x0 === this.context.grid.endPos.x &&
          y0 === this.context.grid.endPos.y
        ) {
          this.drawTile(
            8,
            x1 + (x0 - this.mapAdjustments.x) * tileSize,
            y1 + (y0 - this.mapAdjustments.y) * tileSize
          )

          continue
        }

        this.drawTile(
          mapArray[y0][x0].solid ? 9 : mapArray[y0][x0].colorIndex,
          x1 + (x0 - this.mapAdjustments.x) * tileSize,
          y1 + (y0 - this.mapAdjustments.y) * tileSize
        )
      }
    }
  }

  public drawTile(colorIndex: number, x: number, y: number) {
    this.context.renderer.imageSmoothingEnabled = false
    this.drawRect(x, y, this.context.grid.tileSize, this.context.grid.tileSize, colorIndex)
  }
}

class Loop extends EventEmitter {
  private accumulator: number = 0
  private currentTime: number = 0
  private readonly fps: number
  private paused: boolean
  private readonly step: number

  constructor() {
    super()
    this.fps = 60
    this.paused = false
    this.step = 1 / this.fps
  }

  public start(): void {
    this.init()
    this.paused = false
    this.currentTime = window.performance.now()
    this.accumulator = 0
    this.frame()
  }

  private frame(): void {
    if (!this.paused) {
      let newTime = window.performance.now()

      let frameTime = (newTime - this.currentTime) / 1000

      this.currentTime = newTime
      this.accumulator += frameTime

      while (this.accumulator >= this.step) {
        this.update(this.step)
        this.accumulator -= this.step
      }

      this.render(this.accumulator / this.step)
      requestAnimationFrame(this.frame.bind(this))
    }
  }

  private init(): void {
    this.emit("init")
  }

  private update(interval: number): void {
    this.emit("update", interval)
  }

  private render(delta: number): void {
    this.emit("render", delta)
  }
}

class Grid {
  private _matrix: { solid: boolean, colorIndex: number }[][]
  public width: number = 0
  public height: number = 0
  public startPos: { x: number, y: number } = {x: 0, y: 0}
  public endPos: { x: number, y: number } = {x: 0, y: 0}

  constructor(public tileSize: number = 16) {
    this._matrix = []
  }

  get matrix(): { solid: boolean, colorIndex: number }[][] {
    return this._matrix
  }

  set matrix(value: { solid: boolean, colorIndex: number }[][]) {
    this._matrix = value

    this.height = value.length
    this.width = value[0].length
  }
}

class Canvas {
  public canvas: HTMLCanvasElement
  public renderer: CanvasRenderingContext2D
  public scaleFactor: number

  constructor(config: IGameConfig) {
    this.canvas = document.createElement('canvas')
    document.getElementById(config.name)?.appendChild(this.canvas)
    this.renderer = this.canvas.getContext('2d')!
    this.renderer.imageSmoothingEnabled = false
    this.scaleFactor = config.scale || 1
    this.renderer.scale(this.scaleFactor, this.scaleFactor)

    this.canvas.width = config.width * this.scaleFactor || 64 * this.scaleFactor
    this.canvas.height = config.height * this.scaleFactor || 64 * this.scaleFactor

    if (config.fullscreen) {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    }
  }
}

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
      scale: 5
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
  }
}

const app = new App()
app.grid.matrix = [
  [
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: true, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7}
  ],
  [
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: true, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7}
  ],
  [
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: true, colorIndex: 7},
    {solid: true, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7}
  ],
  [
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: true, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7}
  ],
  [
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7}
  ],
  [
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7}
  ],
  [
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7}
  ],
  [
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7},
    {solid: false, colorIndex: 7}
  ]
]

app.grid.startPos = {
  x: 0,
  y: 0
}

app.grid.endPos = {
  x: 7,
  y: 2
}

app.start()

window._ctx = app
