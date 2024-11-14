// priority:11
/**@type {typeof Events.Event}*/
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
    }

    // 定参数
    let args = []
    let i = -1
    for (; i <= 3; i++) {
        if (i >= 0) args.push('a' + i)
        Event.prototype[`fire${args.length}`] = eval(`function(${args.join(',')}){
            for (let f of this.__set) f(${args})
            for (let f of this.__onceSet) f(${args})
            this.__onceSet.clear()
        }`)
    }
    // 变长判断参数
    for (; i < 10; i++) args.push('a' + i)
    Event.prototype[`fire`] = eval(`function(${args.join(',')}){
        let argsHack = [${args.join(',')}]
        for (let i = ${args.length} - 1; i >= 0; i--) {
            if(argsHack[i] === undefined) argsHack.pop()
            else break
        }
        return this.fireVar(argsHack)
    }`)

    this.Event = global.setter.Event = Event
}
