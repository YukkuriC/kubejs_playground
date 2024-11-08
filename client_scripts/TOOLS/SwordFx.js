NetworkEvents.dataReceived('yc:sword_hit', e => {
    let { data, level } = e
    let [x, y, z] = data.pos
    // sound
    let hitSound = `entity.player.attack.${['crit', 'knockback', 'strong', 'sweep'][Math.floor(Math.random() * 4)]}`
    level.playLocalSound(x, y, z, hitSound, 'players', 1, 0, true)
    // blast
    for (let p of ['sonic_boom', 'sweep_attack']) level.spawnParticles(p, true, x, y, z, 0, 0, 0, 1, 0)
})
NetworkEvents.dataReceived('yc:sword_cast', e => {
    let { data, level } = e
    let [x, y, z] = data.pos
    let [xl, yl, zl] = data.look
    level.playLocalSound(x + xl * 5, y + yl * 5, z + zl * 5, 'entity.lightning_bolt.impact', 'players', 1, Math.random(), true)
})

{
    let pSingle = type => (x, y, z) => Client.particleEngine.createParticle(type, x, y, z, 0, 0, 0)
    let pLine = (spawner, x1, y1, z1, x2, y2, z2) => {
        spawner(x1, y1, z1)
        let dx = Math.abs(x1 - x2),
            dy = Math.abs(y1 - y2),
            dz = Math.abs(z1 - z2),
            delta = (dx + dy + dz) / 3
        if (Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(z1 - z2) > 0.5) {
            let nx = (x1 + x2) / 2 + (Math.random() - 0.5) * delta * 0.7,
                ny = (y1 + y2) / 2 + (Math.random() - 0.5) * delta * 0.7,
                nz = (z1 + z2) / 2 + (Math.random() - 0.5) * delta * 0.7
            pLine(spawner, x1, y1, z1, nx, ny, nz)
            pLine(spawner, nx, ny, nz, x2, y2, z2)
        }
    }
    NetworkEvents.dataReceived('yc:sword_line', e => {
        let { data } = e
        let [x, y, z] = data.from
        let [x2, y2, z2] = data.to
        pLine(pSingle(data.particle ?? 'electric_spark'), x, y, z, x2, y2, z2)
    })
}
