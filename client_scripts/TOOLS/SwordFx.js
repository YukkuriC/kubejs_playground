NetworkEvents.dataReceived('yc:sword_hit', e => {
    let { data, level } = e
    let [x, y, z] = data.pos
    // sound
    let hitSound = `entity.player.attack.${['crit', 'knockback', 'strong', 'sweep'][Math.floor(Math.random() * 4)]}`
    level.playLocalSound(x, y, z, hitSound, 'players', 1, 0, true)
    // blast
    for (let p of ['sonic_boom', 'sweep_attack']) level.spawnParticles(p, true, x, y, z, 0, 0, 0, 1, 0)
})
