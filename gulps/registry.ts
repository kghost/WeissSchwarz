import UndertakerRegistry from 'undertaker-registry';

export class TasksRegistry extends UndertakerRegistry {
  private ts: any = {};

  public get<TTaskFunction>(taskname: string) {
    const [ns, ...args] = taskname.split('|');
    const o = {
      [taskname]: async () => {
        const m = await import(`./${ns}`);
        await m.default(...args);
      },
    };
    return (o[taskname] as any) as TTaskFunction;
  }

  public set<TTaskFunction>(name: string, fn: TTaskFunction): TTaskFunction {
    this.ts[name] = fn;
    return fn;
  }

  public tasks() {
    return this.ts;
  }
}
