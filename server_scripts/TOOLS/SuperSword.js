ItemEvents.rightClicked('yc:sword', event => {
    const { level, player, item, hand, server } = event
    let posPlayer = player.eyePosition
    let look = player.lookAngle
    let posArr = [posPlayer.x(), posPlayer.y(), posPlayer.z()]
    let lookArr = [look.x(), look.y(), look.z()]
    let source = null
    let hit = 0,
        pick = 0
    let theOrb = null
    for (let e of level.getEntitiesWithin(player.boundingBox.inflate(50))) {
        let isLiving = e.isLiving() && e.isAlive() && e !== player,
            isPickable = e.type == 'minecraft:item' || e.type == 'minecraft:experience_orb'
        if (!isLiving && !isPickable) continue
        // check range
        let pos = e.eyePosition
        let dist = pos.distanceTo(posPlayer)
        if (dist == 0 || dist > 50) continue
        let dpos = pos.subtract(posPlayer).scale(1 / dist)
        if (dpos.x() * lookArr[0] + dpos.y() * lookArr[1] + dpos.z() * lookArr[2] < 0.8) continue
        // do attack
        if (isLiving) {
            if (!source) source = (Platform.getMcVersion() > '1.20' ? e.damageSources() : DamageSource).playerAttack(player)
            e.attack(source, 15)
            server.sendData('yc:sword_line', {
                from: posArr,
                to: [pos.x(), pos.y(), pos.z()],
                particle: 'witch',
            })
            hit += 0.2
        } else {
            e.teleportTo.apply(e, posArr)
            pick += 0.05
            // merge exp orb
            if (e.type == 'minecraft:experience_orb') {
                let { Count, Value } = e.nbt
                if (theOrb) {
                    theOrb.value += Count * Value
                    e.discard()
                } else {
                    theOrb = e
                    e.mergeNbt({
                        Count: 1,
                        Value: Count * Value,
                    })
                }
            }
        }
    }
    player.swing(hand, true)
    if (hit || pick) player.addItemCooldown(item, 20)
    server.sendData('yc:sword_cast', {
        pos: posArr,
        look: lookArr,
        hit: hit,
        pick: pick,
    })
})

EntityEvents.hurt(e => {
    const { entity, source, level, server } = e
    const { player } = source
    if (player?.mainHandItem?.id != 'yc:sword') return
    // drain max health
    const before = entity.getAttributeBaseValue('generic.max_health')
    entity.setAttributeBaseValue('generic.max_health', Math.ceil(before / 2))
    // less invulnerable
    entity.invulnerableTime = Math.min(entity.invulnerableTime, 3)
    // boost health
    const delta = before / 2
    player.absorptionAmount = Math.min(1000, player.absorptionAmount + delta)
    // fx
    let headPos = entity.eyePosition
    let posArr = [headPos.x(), headPos.y(), headPos.z()]
    server.sendData('yc:sword_hit', {
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
                server.sendData('yc:sword_line', {
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
    let val = player.absorptionAmount - 20
    if (val > 0) {
        if (val > 80) val /= 2
        else if (val > 40) val -= 10
        else if (val > 20) val -= 5
        else val = Math.max(0, val - 2)
        player.setAbsorptionAmount(val + 20)
    }
})
