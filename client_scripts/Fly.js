ClientEvents.tick(e => {
    let {
        player,
        player: { abilities },
    } = Client
    abilities.flyingSpeed = 0.15
    if (!abilities.mayfly) {
        abilities.mayfly = true
        player.onUpdateAbilities()
    }
    // if (player.motionY < -1 && !abilities.flying && !player.isFallFlying()) {
    //     player.startFallFlying()
    // }
})
