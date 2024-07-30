function connArray(origin, conn) {
    const res = origin.slice()
    for (const elem of conn) res.push(elem)
    return res
}

const enc_common = [
    //
    { id: 'mending', lvl: 1 },
    { id: 'unbreaking', lvl: 3 },
]
const enc_tool = connArray(enc_common, [
    { id: 'efficiency', lvl: 5 },
    { id: 'fortune', lvl: 3 },
    { id: 'fire_aspect', lvl: 5 },
    { id: 'sharpness', lvl: 5 },
    { id: 'looting', lvl: 3 },
])
const enc_armor = connArray(enc_common, [
    { id: 'protection', lvl: 4 },
    { id: 'fire_protection', lvl: 4 },
    { id: 'blast_protection', lvl: 4 },
    { id: 'projectile_protection', lvl: 4 },
])

ServerEvents.recipes(e => {
    // tools
    e.shaped(
        'yc:axe',
        [
            //
            'AA',
            'AB',
            ' B',
        ],
        {
            A: '#minecraft:logs',
            B: 'minecraft:stick',
        },
    )
    e.shaped(
        'yc:pickaxe',
        [
            //
            'AAA',
            ' B ',
            ' B ',
        ],
        {
            A: '#minecraft:logs',
            B: 'minecraft:stick',
        },
    )
    e.shaped(
        'yc:hoe',
        [
            //
            'AA',
            ' B',
            ' B',
        ],
        {
            A: '#minecraft:logs',
            B: 'minecraft:stick',
        },
    )
    e.shaped(
        'yc:sword',
        [
            //
            'A',
            'A',
            'B',
        ],
        {
            A: '#minecraft:logs',
            B: 'minecraft:stick',
        },
    )
    e.shaped(
        'yc:shovel',
        [
            //
            'A',
            'B',
            'B',
        ],
        {
            A: '#minecraft:logs',
            B: 'minecraft:stick',
        },
    )
    // armor
    e.shaped(
        'yc:helmet',
        [
            //
            'AAA',
            'A A',
        ],
        {
            A: '#minecraft:logs',
        },
    )
    e.shaped(
        'yc:chestplate',
        [
            //
            'A A',
            'AAA',
            'AAA',
        ],
        {
            A: '#minecraft:logs',
        },
    )
    e.shaped(
        'yc:leggings',
        [
            //
            'AAA',
            'A A',
            'A A',
        ],
        {
            A: '#minecraft:logs',
        },
    )
    e.shaped(
        'yc:boots',
        [
            //
            'A A',
            'A A',
        ],
        {
            A: '#minecraft:logs',
        },
    )
})

ItemEvents.crafted(e => {
    let encsToAdd = null

    switch (e.item.id) {
        case 'yc:axe':
        case 'yc:pickaxe':
        case 'yc:hoe':
        case 'yc:sword':
        case 'yc:shovel':
            encsToAdd = enc_tool
            break

        case 'yc:helmet':
            encsToAdd = connArray(enc_armor, [
                { id: 'aqua_affinity', lvl: 1 },
                { id: 'respiration', lvl: 3 },
            ])
            break
        case 'yc:chestplate':
            encsToAdd = connArray(enc_armor, [{ id: 'thorns', lvl: 3 }])
            break
        case 'yc:leggings':
            encsToAdd = connArray(enc_armor, [{ id: 'swift_sneak', lvl: 3 }])
            break
        case 'yc:boots':
            encsToAdd = connArray(enc_armor, [
                { id: 'feather_falling', lvl: 4 },
                { id: 'soul_speed', lvl: 3 },
                { id: 'depth_strider', lvl: 3 },
            ])
            break
    }

    if (encsToAdd) {
        e.item.getOrCreateTag().merge({
            Enchantments: encsToAdd,
        })
    }
})
