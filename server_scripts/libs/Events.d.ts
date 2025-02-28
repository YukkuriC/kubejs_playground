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

        fire(...args: Parameters<F>): void
        fireVar(args: Parameters<F>): void
    }
    declare type EventClass = ClassType<Event>

    declare class PlayerTickEvents {
        every(n: number): Event<(event: Internal.SimplePlayerEventJS) => void>
    }
}
