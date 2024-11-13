// yield-ables
function WaitTicks(ticks) {
    this.waiting = true
    this.ticks = ticks
}
WaitTicks.prototype = {
    tick() {
        this.ticks--
        if (this.ticks < 0) this.waiting = false
    },
}
function WaitUntil(func) {
    this.waiting = true
    this.until = func
}
WaitUntil.prototype = {
    tick() {
        if (this.until()) this.waiting = false
    },
}

// coroutine wrapper
function CoroutineWrap(iter) {
    this.inner = iter
    this.block = undefined
    this.done = false
    this.id = CoroutineWrap.id++
}
CoroutineWrap.id = 0

// coroutine runners
const allCoroutines = {}
ServerEvents.tick(e => {
    // run all coroutines
    for (let i in allCoroutines) {
        let coroutine = allCoroutines[i]
        try {
            let i
            for (i = 0; i < 100; i++) {
                if (coroutine.block) {
                    coroutine.block.tick()
                    if (coroutine.block.waiting) break
                }
                let { value, done } = coroutine.inner.next()
                // nested coroutine
                if (value?.next) {
                    let nested = StartCoroutine(value)
                    value = new WaitUntil(() => nested.done)
                }
                coroutine.block = value
                coroutine.done = done
                if (coroutine.done) break
            }
            if (i >= 100) throw 'too many skips in one frame'
        } catch (err) {
            e.server.tell(Text.red(`Error in coroutine #${i}: ${err}`))
            delete allCoroutines[i]
        }
    }

    // remove done coroutines, copy keys to avoid modify-in-place
    for (let i of Object.keys(allCoroutines)) {
        if (allCoroutines[i].done) delete allCoroutines[i]
    }
})

function StartCoroutine(iter) {
    let wrap = new CoroutineWrap(iter)
    allCoroutines[wrap.id] = wrap
    return wrap
}

function StopCoroutine(obj) {
    if (obj.id) obj = obj.id
    delete allCoroutines[obj]
}
