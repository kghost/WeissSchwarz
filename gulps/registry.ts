import UndertakerRegistry from "undertaker-registry";

export class TasksRegistry extends UndertakerRegistry {
  private _tasks: any = {}

  get<TTaskFunction>(taskname: string) {
    const [ns, ...args] = taskname.split('|')
    return (async () => {
      const m = await import(`./${ns}`)
      await m.default(...args)
    }) as any as TTaskFunction
  }

  set<TTaskFunction>(name: string, fn: TTaskFunction): TTaskFunction {
    this._tasks[name] = fn
    return fn;
  }

  tasks() {
    return this._tasks;
  }
}
