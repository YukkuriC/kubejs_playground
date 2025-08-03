ServerEvents.recipes(e => {
    e.shapeless('3x echo_shard', ['2x echo_shard', '2x amethyst_shard'])
    e.shapeless('4x echo_shard', ['minecraft:sculk'])
    e.shaped('minecraft:sculk', ['aa', 'aa'], { a: 'echo_shard' })
})
