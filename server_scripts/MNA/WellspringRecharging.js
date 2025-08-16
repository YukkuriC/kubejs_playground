// requires: mna
{
    let WorldMagicProvider = Java.loadClass('com.mna.capabilities.worlddata.WorldMagicProvider')

    let CHECK_INTERVAL = 20
    let ADD_SIZE = 10
    let AFFINITY_TARGETS = ['ARCANE', 'EARTH', 'ENDER', 'FIRE', 'WATER', 'WIND']

    ServerEvents.tick(e => {
        let { server } = e
        if (server.tickCount % CHECK_INTERVAL) return
        let level = server.overworld()
        let players = server.players
        level.getCapability(WorldMagicProvider.MAGIC).ifPresent(m => {
            let powers = m.wellspringRegistry
            for (let player of server.players) {
                let { uuid } = player
                for (let affinity of AFFINITY_TARGETS) {
                    let mult = powers.getEldrinGenerationMultiplierFor(uuid, level, affinity) - 1
                    if (mult >= 0) powers.insertPower(uuid, level, affinity, mult * ADD_SIZE)
                }
            }
        })
    })
}
