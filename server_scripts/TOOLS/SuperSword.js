ItemEvents.rightClicked('yc:sword', event => {
    const { level, player, item, hand } = event
    let posPlayer = player.eyePosition
    let look = player.lookAngle
    let posArr = [posPlayer.x(), posPlayer.y(), posPlayer.z()]
    let lookArr = [look.x(), look.y(), look.z()]
    let source = null
    for (let e of level.getEntitiesWithin(player.boundingBox.inflate(40))) {
        let isLiving = e.isLiving() && e.isAlive() && e !== player,
            isPickable = e.type == 'minecraft:item' || e.type == 'minecraft:experience_orb'
        if (!isLiving && !isPickable) continue
        // check range
        let pos = e.eyePosition
        let dist = pos.distanceTo(posPlayer)
        if (dist == 0 || dist > 40) continue
        let dpos = pos.subtract(posPlayer).scale(1 / dist)
        if (dpos.x() * lookArr[0] + dpos.y() * lookArr[1] + dpos.z() * lookArr[2] < 0.8) continue
        // do attack
        if (isLiving) {
            if (!source) source = (Platform.getMcVersion() > '1.20' ? e.damageSources() : DamageSource).playerAttack(player)
            e.attack(source, 15)
            player.sendData('yc:sword_line', {
                from: posArr,
                to: [pos.x(), pos.y(), pos.z()],
                particle: 'witch',
            })
        } else {
            e.teleportTo.apply(e, posArr)
        }
    }
    player.swing(hand, true)
    player.addItemCooldown(item, 20)
    player.sendData('yc:sword_cast', {
        pos: posArr,
        look: lookArr,
    })
})

EntityEvents.hurt(e => {
    const { entity, source, level } = e
    const { player } = source
    if (player?.mainHandItem?.id != 'yc:sword') return
    // drain max health
    const before = entity.getAttributeBaseValue('generic.max_health')
    entity.setAttributeBaseValue('generic.max_health', Math.ceil(before / 2))
    // less invulnerable
    entity.invulnerableTime = Math.min(entity.invulnerableTime, 3)
    // boost health
    const delta = before / 2
    let existBoost = player
        .getAttribute('generic.max_health')
        .getModifiers()
        .find(x => x.name == 'yc:sword_vampire')
    if (delta > (existBoost?.amount || 0)) player.modifyAttribute('minecraft:generic.max_health', 'yc:sword_vampire', delta, 'addition')
    player.heal(delta)
    // fx
    let headPos = entity.eyePosition
    let posArr = [headPos.x(), headPos.y(), headPos.z()]
    player.sendData('yc:sword_hit', {
        pos: posArr,
    })

    // chain nearby
    if (e.damage > 5)
        level.server.scheduleInTicks(Math.random() * 10 + 4, () => {
            let cnt = 0
            for (let sube of level.getEntitiesWithin(entity.boundingBox.inflate(10))) {
                if (!sube.isLiving() || !sube.isAlive() || sube === entity || sube === player) continue
                let subPos = sube.eyePosition
                sube.attack(source, e.damage)
                player.sendData('yc:sword_line', {
                    from: posArr,
                    to: [subPos.x(), subPos.y(), subPos.z()],
                })
                cnt++
                if (cnt >= 3) break
            }
        })
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
