import 'reflect-metadata';
import { ReflectiveInjector, Injectable, Injector } from 'injection-js';

class Browser {}

@Injectable()
class BrowserHeadless {
  constructor(private http: Http) {}
}

@Injectable()
class Service2 {
  constructor(private injector: Injector) {}

  getService(): void {
    console.log(this.injector.get(Service) instanceof Service);
  }

  createChildInjector(): void {
    const childInjector = ReflectiveInjector.resolveAndCreate([Service], this.injector);
  }
}

const injector = ReflectiveInjector.resolveAndCreate([Service, Http]);

console.log(injector.get(Service) instanceof Service);
