namespace Events {
    declare class Event<F extends Function = (...args: any[]) => void> {
        constructor(name: string)
        name: string
        __set: Set<F>
        __onceSet: Set<F>
        on(onTrigger: F, once = false): () => void
        on(onTrigger: F, once = false, returnThis: true): this
        off(onTrigger: F): void
        setName(name: string): this

        /**
         * 最多检测10个参数
         * @deprecated 使用`eval`，可能有性能问题
         */
        fire(...args: Parameters<F>): void
        fireVar(args: Parameters<F>): void
        fire0(): void
        fire1(arg0): void
        fire2(arg0, arg1): void
        fire3(arg0, arg1, arg2): void
    }
    declare type EventClass = ClassType<Event>
}
