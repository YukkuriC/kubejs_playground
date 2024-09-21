ServerEvents.recipes(e => {
    const targets = ['common', 'uncommon', 'rare', 'epic', 'mythic', 'ancient'].map(x => `apotheosis:${x}_material`)
    const upgrade_mats = [null, 'copper_ingot', 'lapis_lazuli', 'amethyst_shard', 'ender_eye', 'nether_star']
    for (let i = 1; i < targets.length; i++) {
        e.shaped(targets[i], ['x x', ' u ', 'x x'], {
            x: targets[i - 1],
            u: upgrade_mats[i],
        })
    }
})
