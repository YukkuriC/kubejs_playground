type Cls2Obj<CT> = CT extends { new (...args: unknown[]): infer T } ? T : never
class JavaAdapter<CT, U extends Cls2Obj<CT>> extends U {
    constructor<X>(src: CT, overrides: U, ...args: ConstructorParameters<CT>): X
}
