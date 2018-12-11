import { dirname } from 'path';
import { promises } from 'fs';
const { open } = promises;
import { mkdirp } from 'fs-extra';

import { Mutex } from 'async-mutex';

const locks = new Map<string, Mutex>();
function GetFileLock(path: string) {
  const e = locks.get(path);
  if (e) return e;
  else {
    const lock = new Mutex();
    locks.set(path, lock);
    return lock;
  }
}

export async function lockReadAndWrite(
  path: string,
  work: (
    data: string | undefined,
    write: (s: string) => Promise<void>
  ) => Promise<void>
): Promise<void> {
  await mkdirp(dirname(path));
  const close: Array<() => Promise<void>> = [];
  try {
    let read: () => Promise<string | undefined> = async () => void 0;
    let write: (s: string) => Promise<void> = async (s) => void 0;
    try {
      const fd = await open(path, 'r+');
      close.push(async () => await fd.close());
      read = async () => await fd.readFile({ encoding: 'utf8' });
      write = async (s) => {
        await fd.truncate(0);
        await fd.write(s, 0);
      };
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      try {
        const fd = await open(path, 'wx');
        close.push(async () => await fd.close());
        read = async () => undefined;
        write = async (s) => {
          await fd.truncate(0);
          await fd.write(s, 0);
        };
      } catch (e) {
        if (e.code !== 'EEXIST') throw e;
        return await lockReadAndWrite(path, work); // retry
      }
    }

    const release = await GetFileLock(path).acquire();
    close.push(async () => await release());

    await work(await read(), write);
  } finally {
    for (const c of close.reverse()) await c();
  }
}
