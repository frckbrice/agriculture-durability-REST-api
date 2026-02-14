import { Injectable } from '@nestjs/common';
import { ClassNode } from '@nestjs/core/inspector/interfaces/node.interface';

@Injectable()
export class ApplyNixins {
  ApplyOject(derivCtor: any, baseCtor: any[]) {
    baseCtor.forEach((baseCtor) => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach((key) => {
        derivCtor.prototype[key] = baseCtor.prototype[key];
      });
    });

    return derivCtor;
  }
}
