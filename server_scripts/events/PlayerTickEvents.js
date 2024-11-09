/**@type {Events.PlayerTickEvents}*/
const PlayerTickEvents = (() => {
    /**@type {Map<number,Events.Event>}*/
    let cache = new Map()
    PlayerEvents.tick(e => {
        for (let pair of cache.entries()) {
            if (e.player.age % pair[0]) return
            pair[1].fire1(e)
        }
    })
    return {
        every(n) {
            n = Math.max(1, Math.round(n))
            if (!cache.has(n)) {
                cache.set(n, new Event(`every ${n} ticks`))
            }
            return cache.get(n)
        },
    }
})()

global.PlayerTickEvents = PlayerTickEvents
