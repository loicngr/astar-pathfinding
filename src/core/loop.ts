import EventEmitter from "eventemitter3"

export class Loop extends EventEmitter {
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
