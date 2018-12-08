import gulp from 'gulp';
import UndertakerRegistry from 'undertaker-registry';

import { TasksRegistry } from './gulps/registry';

gulp.registry(new TasksRegistry() as UndertakerRegistry);
