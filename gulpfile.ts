import gulp from 'gulp';
import UndertakerRegistry from 'undertaker-registry';

import { TasksRegistry } from './gulps/registry';

process.on('unhandledRejection', (e) => {
  throw e;
});

gulp.registry(new TasksRegistry() as UndertakerRegistry);
