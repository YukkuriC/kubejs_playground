ItemEvents.rightClicked('yc:sword', e => {
    const { level, player } = e
    const { x, y, z } = player
    const rot = (player.yRotO + 90) * (3.14159 / 180)
    for (let d = -2; d <= 2; d++) {
        let rot1 = rot + d * 0.4
        for (let i = 0; i < 15 - Math.abs(d * 5); i++) {
            let r = 1.25 * (i + 1)
            let obj = new $EvokerFangs(level, x + Math.cos(rot1) * r, y, z + Math.sin(rot1) * r, rot1, i + Math.abs(d * 2), player)
            level.addFreshEntity(obj)
        }
    }
})

EntityEvents.hurt(e => {
    const { entity, source } = e
    const { player } = source
    if (player?.mainHandItem?.id != 'yc:sword') return
    const before = entity.maxHealth
    entity.setMaxHealth(Math.ceil(entity.maxHealth / 2))
    player.heal(before - entity.maxHealth)
    if (player.shiftKeyDown) e.cancel()
})
