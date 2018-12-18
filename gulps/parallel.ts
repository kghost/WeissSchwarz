export function parallel(depth: number) {
  const tasks = Array(depth);
  let resolve: (() => any) | null = null;

  async function x(f: () => Promise<any>) {
    const i = tasks.findIndex((e) => !e);
    if (i >= 0) {
      console.log(`Start task ${i}`);
      tasks[i] = f().finally(() => {
        const tmp = resolve;
        resolve = null;
        tasks[i] = undefined;
        console.log(`Done task ${i}`);
        if (tmp) tmp();
      });
    } else {
      const promise = new Promise((res, rej) => (resolve = res));
      console.log(`Waiting tasks`);
      await promise;
      console.log(`Continuing tasks`);
      x(f);
    }
  }

  return x;
}
