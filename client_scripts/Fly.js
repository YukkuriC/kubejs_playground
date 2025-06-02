let inputCache = {}
let inputHit = {}
for (let keyTmp of 'up,down,left,right,jumping'.split(',')) {
    let key = keyTmp
    Object.defineProperty(inputHit, key, {
        get() {
            return !inputCache[key] && this.input[key]
        },
    })
}
let DASH_STRENGTH = 2

ClientEvents.tick(e => {
    let {
        player,
        player: { abilities, input },
    } = Client
    abilities.flyingSpeed = 0.15
    if (!abilities.mayfly) {
        abilities.mayfly = true
        player.onUpdateAbilities()
    }
    // if (player.motionY < -1 && !abilities.flying && !player.isFallFlying()) {
    //     player.startFallFlying()
    // }

    // handle input
    inputHit.input = input
    if (inputHit.jumping) {
        player.jumpFromGround()
    }
    // dashes
    let xx = 0,
        zz = 0
    for (let dir of ['up', 'down', 'left', 'right']) {
        if (!inputHit[dir]) continue
        let timeKey = dir + '_t'
        let lastHitTime = inputCache[timeKey] || -114514
        if (player.age - lastHitTime < 5) {
            delete inputCache[timeKey]
            switch (dir) {
                case 'up':
                    zz++
                    break
                case 'down':
                    zz--
                    break
                case 'left':
                    xx++
                    break
                case 'right':
                    xx--
                    break
            }
        } else {
            inputCache[timeKey] = player.age
        }
    }
    if (xx || zz) {
        let rot = (player.yRotO * KMath.PI) / 180
        let dx = (Math.cos(rot) * xx - Math.sin(rot) * zz) * DASH_STRENGTH,
            dz = (Math.sin(rot) * xx + Math.cos(rot) * zz) * DASH_STRENGTH
        if (!player.onGround()) {
            dx *= 0.5
            dz *= 0.5
        }
        player.addDeltaMovement(new Vec3d(dx, 0, dz))
    }

    // update old input
    Object.assign(inputCache, input)
})
