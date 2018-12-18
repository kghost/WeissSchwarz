export class Parallel {
  private readonly tasks: number[];
  private resolve: (() => any) | null = null;

  constructor(private readonly depth: number) {
    function* g(n: number) {
      while (n > 0) yield n--;
    }

    this.tasks = [...g(depth)];
  }

  public async do(f: () => Promise<any>) {
    if (this.tasks.length > 0) {
      const i = this.tasks.pop() as number;
      console.log(`Start task ${i}`);
      f().finally(() => {
        const tmp = this.resolve;
        this.resolve = null;
        this.tasks.push(i);
        console.log(`Done task ${i}`);
        if (tmp) tmp();
      });
    } else {
      if (this.resolve !== null) throw new Error('resolve !== null');
      const promise = new Promise((res, rej) => (this.resolve = res));
      console.log(`Waiting tasks`);
      await promise;
      console.log(`Continuing tasks`);
      this.do(f);
    }
  }

  public async waitAll() {
    if (this.depth === this.tasks.length) console.log(`All tasks done`);
    else {
      if (this.resolve !== null) throw new Error('resolve !== null');
      const promise = new Promise((res, rej) => (this.resolve = res));
      console.log(`Waiting all tasks done`);
      await promise;
      await this.waitAll();
    }
  }
}
