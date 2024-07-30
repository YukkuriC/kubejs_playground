PlayerEvents.loggedIn(e => {
    if (!e.player.stages.has('starting_items_yc')) {
        e.player.stages.add('starting_items_yc')
        e.player.give('projecte:transmutation_tablet')
        e.player.give('golden_apple')
    }
})

EntityEvents.hurt(e => {
    const src = e.getSource()
    if (src.player) {
        if (src.getType() == 'thrown' || src.getType() == 'arrow') {
            const target = e.entity
            const { x, y, z } = target
            e.level
                .createExplosion(x, y + 1, z)
                .strength(5)
                .explosionMode('none')
                .explode()
        }
    }
})
