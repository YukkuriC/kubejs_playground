ServerEvents.tags('block', e => {
    let ores = [
        // exceptions
        'moon_cheese_ore',
        'deepslate_ice_shard_ore',
        'glacio_ice_shard_ore',
    ]
    for (let pair of Object.entries({
        moon: 'desh',
        mars: 'ostrum',
        venus: 'calorite',
    })) {
        let [planet, ore] = pair
        ores.push(`${planet}_${ore}_ore`, `deepslate_${ore}_ore`, `${planet}_ice_shard_ore`)
    }
    ores = ores.map(x => `ad_astra:${x}`)

    for (let key of ['forge', 'ad_astra']) e.add(`${key}:ores`, ores)
})
