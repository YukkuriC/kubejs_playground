EntityEvents.death('warden', e => {
    /** @type {Internal.Warden} */
    let entity = e.entity

    // next iter
    if (entity.persistentData.killCount >= 4) return
    entity.persistentData.killCount = 1 + (entity.persistentData.killCount || 0)
    entity.maxHealth *= 10

    // totem
    {
        entity.removeAllEffects()
        let { potionEffects } = entity
        potionEffects.add('regeneration', 1200, entity.persistentData.killCount + 1)
        potionEffects.add('resistance', 1200, entity.persistentData.killCount)
        potionEffects.add('fire_resistance', 1200, 0)
        potionEffects.add('strength', 1200, 1 + entity.persistentData.killCount * 2)
        e.level.broadcastEntityEvent(entity, 35)
    }

    // force recover
    let recover = () => {
        entity.health = entity.maxHealth
    }
    recover()
    e.server.scheduleInTicks(1, recover)

    e.cancel()
})
