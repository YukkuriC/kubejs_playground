NetworkEvents.dataReceived('yc:sword_hit', e => {
    let { data, level } = e
    let [x, y, z] = data.pos
    // sound
    let hitSound = 'minecraft:block.glass.break'
    level.playLocalSound(x, y, z, hitSound, 'players', 1, 0, true)
    // blast
    for (let p of ['sonic_boom', 'sweep_attack']) level.spawnParticles(p, true, x, y, z, 0, 0, 0, 1, 0)
})
NetworkEvents.dataReceived('yc:sword_cast', e => {
    let { data, level } = e
    let [x, y, z] = data.pos
    let [xl, yl, zl] = data.look
    if (data.hit) {
        data.hit = Math.min(1, data.hit)
        level.playLocalSound(x + xl * 9, y + yl * 9, z + zl * 9, 'entity.lightning_bolt.impact', 'players', Math.min(1, data.hit), 0, true)
        for (let i = 0; i < data.hit; i += 0.2)
            level.playLocalSound(x + xl * 6, y + yl * 6, z + zl * 6, 'block.amethyst_block.break', 'players', 1, 0, true)
    }
    if (data.pick)
        level.playLocalSound(
            x + xl * 5,
            y + yl * 5,
            z + zl * 5,
            'minecraft:block.dispenser.launch',
            'players',
            Math.min(1, data.pick),
            0,
            true,
        )

    // cast range indicator
    let lx, ly
    if (xl == 0 && zl == 0) {
        let sq2 = Math.sqrt(2) / 2
        lx = Vec3d(sq2, sq2 * yl, 0)
        ly = Vec3d(0, sq2 * yl, sq2)
    } else {
        let len = Math.sqrt(xl * xl + zl * zl)
        lx = Vec3d(
            // y=0的垂直单位向量
            zl / len,
            0,
            -xl / len,
        )
        ly = Vec3d(xl, yl, zl).cross(lx)
    }
    for (let ind_radius of [2, 3, 5, 7]) {
        let ind_radius2 = ind_radius * Math.sqrt(1 - Math.pow(0.8, 2))
        let ind_cnt = ind_radius * 10
        let ind_center = Vec3d(x + xl * ind_radius, y + yl * ind_radius, z + zl * ind_radius)
        // circle
        for (let i = 0; i < ind_cnt; i++) {
            let angle = (3.141593 * 2 * i) / ind_cnt
            let target = ind_center.add(lx.scale(Math.cos(angle) * ind_radius2)).add(ly.scale(Math.sin(angle) * ind_radius2))
            Client.particleEngine.createParticle('dragon_breath', target.x(), target.y(), target.z(), 0, 0, 0)
        }
    }
})

{
    let pSingle = type => (x, y, z) => Client.particleEngine.createParticle(type, x, y, z, 0, 0, 0)
    let pLine = (spawner, x1, y1, z1, x2, y2, z2) => {
        spawner(x1, y1, z1)
        let dx = Math.abs(x1 - x2),
            dy = Math.abs(y1 - y2),
            dz = Math.abs(z1 - z2),
            delta = (dx + dy + dz) / 3
        if (delta > 0.15) {
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
