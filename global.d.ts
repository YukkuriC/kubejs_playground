type Super$<T> = `super$${T}`
type AdapterPrefixed<T> = { [k in keyof T as Super$<k>]: T[k] }
type AdapterMerged<T> = T & AdapterPrefixed<T>

type Cls2Obj<CT> = CT extends { new (...args: unknown[]): infer T } ? T : never
class JavaAdapter<CT, F, U = AdapterMerged<Cls2Obj<CT>>, R = F & U> extends R {
    constructor(src: CT, overrides: R, ...args: ConstructorParameters<CT>)
}
