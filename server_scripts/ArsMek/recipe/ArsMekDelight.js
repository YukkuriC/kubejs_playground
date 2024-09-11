ServerEvents.recipes(e => {
    // 至高木去皮
    let magicWoodRecipes = []
    for (let color of ['red', 'green', 'blue', 'purple']) {
        for (let type of ['wood', 'log']) {
            let recipe = e
                .custom({
                    type: 'farmersdelight:cutting',
                    ingredients: [
                        {
                            item: `ars_nouveau:${color}_archwood_${type}`,
                        },
                    ],
                    result: [
                        {
                            item: `ars_nouveau:stripped_${color}_archwood_${type}`,
                        },
                        {
                            item: 'farmersdelight:tree_bark',
                        },
                    ],
                    sound: 'minecraft:item.axe.strip',
                    tool: {
                        type: 'farmersdelight:tool_action',
                        action: 'axe_strip',
                    },
                })
                .id(`kubejs:cutting_magic_${color}_${type}`)
            magicWoodRecipes.push(recipe)
        }
    }
    for (let type of ['', '_log']) {
        let recipe = e
            .custom({
                type: 'farmersdelight:cutting',
                ingredients: [
                    {
                        item: `ars_elemental:yellow_archwood${type}`,
                    },
                ],
                result: [
                    {
                        item: `ars_elemental:stripped_yellow_archwood${type}`,
                    },
                    {
                        item: 'farmersdelight:tree_bark',
                    },
                ],
                sound: 'minecraft:item.axe.strip',
                tool: {
                    type: 'farmersdelight:tool_action',
                    action: 'axe_strip',
                },
            })
            .id(`kubejs:cutting_magic_yellow${type || '_wood'}`)
        magicWoodRecipes.push(recipe)
    }
})
