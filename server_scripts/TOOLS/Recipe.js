ServerEvents.recipes(e => {
    function connArray(origin, conn) {
        const res = origin.slice()
        for (const elem of conn) res.push(elem)
        return res
    }

    const enc_tool = [
        { id: 'efficiency', lvl: 5 },
        { id: 'fortune', lvl: 3 },
        { id: 'fire_aspect', lvl: 5 },
        { id: 'sharpness', lvl: 5 },
        { id: 'looting', lvl: 3 },
    ]
    const enc_armor = [
        { id: 'protection', lvl: 4 },
        { id: 'fire_protection', lvl: 4 },
        { id: 'blast_protection', lvl: 4 },
        { id: 'projectile_protection', lvl: 4 },
    ]

    const enchant_map = {
        'yc:axe': enc_tool,
        'yc:pickaxe': enc_tool,
        'yc:hoe': enc_tool,
        'yc:sword': enc_tool,
        'yc:shovel': enc_tool,
        'yc:helmet': connArray(enc_armor, [
            { id: 'aqua_affinity', lvl: 1 },
            { id: 'respiration', lvl: 3 },
        ]),
        'yc:chestplate': connArray(enc_armor, [{ id: 'thorns', lvl: 3 }]),
        'yc:leggings': connArray(enc_armor, [{ id: 'swift_sneak', lvl: 3 }]),
        'yc:boots': connArray(enc_armor, [
            { id: 'feather_falling', lvl: 4 },
            { id: 'soul_speed', lvl: 3 },
            { id: 'depth_strider', lvl: 3 },
        ]),
    }

    function postEnchant(_, item) {
        let encList = enchant_map[item.id]
        item.getOrCreateTag().merge({
            Enchantments: encList,
            Unbreakable: 1,
        })
        return item
    }

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
    ).modifyResult(postEnchant)
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
    ).modifyResult(postEnchant)
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
    ).modifyResult(postEnchant)
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
    ).modifyResult(postEnchant)
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
    ).modifyResult(postEnchant)
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
    ).modifyResult(postEnchant)
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
    ).modifyResult(postEnchant)
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
    ).modifyResult(postEnchant)
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
    ).modifyResult(postEnchant)
    // else
    e.shapeless('yc:stick', ['minecraft:stick'])
})
