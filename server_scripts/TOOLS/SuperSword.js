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
    // drain max health
    const before = entity.getAttributeBaseValue('generic.max_health')
    entity.setAttributeBaseValue('generic.max_health', Math.ceil(before / 2))
    // less invulnerable
    entity.invulnerableTime = Math.max(entity.invulnerableTime, 3)
    // boost health
    const delta = before / 2
    let existBoost = player
        .getAttribute('generic.max_health')
        .getModifiers()
        .find(x => x.name == 'yc:sword_vampire')
    if (delta > (existBoost?.amount || 0)) player.modifyAttribute('minecraft:generic.max_health', 'yc:sword_vampire', delta, 'addition')
    player.heal(delta)
})

PlayerTickEvents.every(40).on(e => {
    let { player } = e
    let healthBoost = player
        .getAttribute('generic.max_health')
        .getModifiers()
        .find(x => x.name == 'yc:sword_vampire')
    global.test = healthBoost
    if (healthBoost) {
        let val = healthBoost.amount
        if (val > 80) val -= 20
        else if (val > 40) val -= 10
        else if (val > 20) val -= 5
        else val = Math.max(0, val - 2)
        player.modifyAttribute('minecraft:generic.max_health', 'yc:sword_vampire', val, 'addition')
        player.heal(0.01)
    }
})
