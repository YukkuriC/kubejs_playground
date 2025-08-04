type Super$<T> = `super$${T}`
type AdapterPrefixed<T> = { [k in keyof T as Super$<k>]: T[k] }
type AdapterMerged<T> = T & AdapterPrefixed<T>
type MergedTuple<L extends unknown[], RET = {}> = L['length'] extends 0
    ? RET
    : L extends [infer H, ...infer L2]
    ? MergedTuple<L2, RET & H>
    : never

type Cls2Obj<CT> = CT extends { new (...args: unknown[]): infer T } ? T : never
class JavaAdapter<CT, IT extends unknown[], F, U = AdapterMerged<Cls2Obj<CT> & MergedTuple<IT>>, R = F & U> extends R {
    constructor(src: CT, /* ...interfaces: IT, TODO: support multi-interface impl. */ overrides: R, ...args: ConstructorParameters<CT>)
}
