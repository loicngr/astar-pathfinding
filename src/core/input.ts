export class Input {
  private keys: Map<string, boolean>
  private lastKeyPressed?: string

  constructor() {
    this.keys = new Map()

    this.registerEvents()
    this.registerKeyboardKeys()
  }

  private registerEvents(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.keys.has(e.code)) {
        e.preventDefault()
      }

      this.keys.set(e.code, true)
    })

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (this.keys.has(e.code)) {
        e.preventDefault()
      }

      this.lastKeyPressed = undefined
      this.keys.set(e.code, false)
    })
  }

  private registerKeyboardKeys(): void {
    this.keys = new Map([
      ['ArrowDown', false],
      ['ArrowUp', false],
      ['ArrowLeft', false],
      ['ArrowRight', false],
      ['Space', false],
    ])
  }

  public isDown(code: KeyboardEvent['code']): boolean {
    return this.keys.get(code) === true
  }

  public justDown(code: KeyboardEvent['code']): boolean {
    if (this.keys.get(code)) {
      if (this.lastKeyPressed === code) {
        this.lastKeyPressed = code
        return false
      }

      this.lastKeyPressed = code
      return true
    }

    return false
  }
}
