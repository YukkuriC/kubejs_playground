NetworkEvents.dataReceived('yc:sword_hit', e => {
    let { data, level } = e
    let [x, y, z] = Particles.normList(data.pos)
    // sound
    let hitSound = 'minecraft:block.glass.break'
    level.playLocalSound(x, y, z, hitSound, 'players', 1, 0, true)
    // blast
    for (let p of ['sonic_boom', 'sweep_attack']) Client.particleEngine.createParticle(p, x, y, z, 0, 0, 0)
})
NetworkEvents.dataReceived('yc:sword_cast', e => {
    let { data, level } = e
    let [x, y, z] = Particles.normList(data.pos)
    let [xl, yl, zl] = Particles.normList(data.look)
    let data_hit = data.hit.asDouble
    let data_pick = data.pick.asDouble
    if (data_hit > 0) {
        data_hit = Math.min(1, data_hit)
        level.playLocalSound(x + xl * 9, y + yl * 9, z + zl * 9, 'entity.lightning_bolt.impact', 'players', Math.min(1, data_hit), 0, true)
        for (let i = 0; i < data_hit; i += 0.2)
            level.playLocalSound(x + xl * 6, y + yl * 6, z + zl * 6, 'block.amethyst_block.break', 'players', 1, 0, true)
    }
    if (data_pick > 0)
        level.playLocalSound(
            x + xl * 5,
            y + yl * 5,
            z + zl * 5,
            'minecraft:block.dispenser.launch',
            'players',
            Math.min(1, data_pick),
            0,
            true,
        )

    // cast range indicator
    let axes = global.Particles.getAxes(xl, yl, zl) // axes

    let circles = [[6, 2]]
    for (let ind_radius of [2, 3, 5, 7]) {
        circles.push([ind_radius, ind_radius * Math.sqrt(1 - Math.pow(0.8, 2))])
    }
    let circleSpawner = global.Particles.getSpawner('dragon_breath')
    let starSpawner = global.Particles.getSpawner('end_rod')
    for (let pair of circles) {
        let [ind_radius, ind_radius2] = pair
        let ind_cnt = ind_radius2 * 10
        if (data_hit) ind_cnt *= 2
        if (data_pick) ind_cnt *= 1.2
        let ind_center = Vec3d(x + xl * ind_radius, y + yl * ind_radius, z + zl * ind_radius)
        // circle
        global.Particles.circle(circleSpawner, ind_center, axes, ind_radius2, ind_cnt)
    }
    // star
    let offset = Math.random() * KMath.PI
    if (data_pick) {
        let ind_radius = 5
        let ind_center = Vec3d(x + xl * ind_radius, y + yl * ind_radius, z + zl * ind_radius)
        global.Particles.star(starSpawner, ind_center, axes, 2, 6, 2, offset, 20)
    }
    if (data_hit) {
        let ind_radius = 8
        let ind_center = Vec3d(x + xl * ind_radius, y + yl * ind_radius, z + zl * ind_radius)
        global.Particles.star(starSpawner, ind_center, axes, 4, 6, 1, offset)
        global.Particles.star(starSpawner, ind_center, axes, 4, 6, 2, offset)
    }
})

{
    NetworkEvents.dataReceived('yc:sword_line', e => {
        let { data } = e
        global.Particles.lightning(data.particle ?? 'electric_spark', data.from, data.to)
    })
}
