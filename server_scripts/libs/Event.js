// priority:11
{
    /**@type {Events.Event}*/
    let Event = function () {
        this.name = ''
        this.__set = new Set()
        this.__onceSet = new Set()
    }

    Event.prototype = {
        setName(name) {
            this.name = name ?? ''
            return this
        },
        toString() {
            return `[Event]${this.name}(triggers: ${this.__set.size} + ${this.__onceSet.size} once)`
        },
        on(onTrigger, once, returnThis) {
            let target = once ? this.__onceSet : this.__set
            target.add(onTrigger)
            if (returnThis) return this
            return () => target.delete(onTrigger)
        },
        off(onTrigger) {
            this.__set.delete(onTrigger)
            this.__onceSet.delete(onTrigger)
        },
        fireVar(args) {
            for (let f of this.__set) f.apply(null, args)
            for (let f of this.__onceSet) f.apply(null, args)
            this.__onceSet.clear()
        },
        fire() {
            return this.fireVar(Array.from(arguments))
        },
    }

    this.Event = global.Event = Event
}
