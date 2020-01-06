"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// export class BaseResourceGroup implements ResourceGroup {
//   name: string;
//   protected resources: Resource[] = [];
//   constructor(name: string) {
//     this.name = name;
//   }
//   async build(app: Application): Promise<void> {
//     await Promise.all(this.getResources().map(r => r.build(app)));
//   }
//   add(res: Resource): this {
//     throw new Error("Method not implemented.");
//   }
//   getResources(): Resource[] {
//     throw new Error("Method not implemented.");
//   }
//   protected emit() {}
//   protected async buildResource(res: Resource, app: Application) {
//     const result = await res.build(app);
//   }
// }
