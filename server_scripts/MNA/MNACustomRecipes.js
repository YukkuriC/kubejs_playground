// requires: mna
ServerEvents.recipes(e => {
    // auto rune patterns
    e.forEachRecipe({ type: 'mna:runescribing' }, recipe => {
        let target = recipe.json.get('output').asString
        e.shapeless(target, [
            Item.of('mna:runescribing_recipe_paper', { runescribe_recipe_id: String(recipe.id) }).strongNBT(),
            'blaze_rod',
            'mna:rune_pattern',
        ]).keepIngredient('mna:runescribing_recipe_paper')
    })
    // auto crushing
    if (Platform.isLoaded('create')) {
        e.forEachRecipe({ type: 'mna:crushing' }, recipe => {
            let raw = recipe.json
            let res = [
                {
                    count: raw.get('output_quantity').asDouble,
                    item: raw.get('output').asString,
                },
            ]
            let byproducts = raw.get('byproducts')
            if (byproducts)
                byproducts.asJsonArray.forEach(e => {
                    let repeat = e.get('rolls') || 1
                    for (let i = 0; i < repeat; i++) res.push(e)
                })
            e.custom({
                type: 'create:crushing',
                ingredients: [
                    {
                        item: raw.get('input').asString,
                    },
                ],
                processingTime: 150,
                results: res,
            })
        })
        e.forEachRecipe({ type: 'mna:runeforging' }, recipe => {
            let raw = recipe.json

            let res = [
                {
                    item: raw.get('output').asString,
                    count: raw.get('output_quantity') || 1,
                },
            ]
            let byproducts = raw.get('byproducts')
            if (byproducts) byproducts.asJsonArray.forEach(e => res.push(e))

            let inputs = [
                {
                    item: raw.get('pattern').asString,
                },
            ]
            let material = raw.get('material')?.asString || 'mna:superheated_vinteum_ingot'
            inputs.push({ item: material })

            e.custom({
                type: 'create:compacting',
                ingredients: inputs,
                results: res,
            })
        })
    }

    // contents
    e.custom({
        type: 'mna:manaweaving-recipe',
        output: {
            item: 'yc:mna/alt_mana_crystal',
        },
        tier: 2,
        items: [
            'mna:mana_crystal_fragment',
            'mna:mana_crystal_fragment',
            'mna:mana_crystal_fragment',
            'mna:mana_crystal_fragment',
            'nether_star',
            'mna:mana_crystal_fragment',
            'mna:mana_crystal_fragment',
            'mna:mana_crystal_fragment',
            'mna:mana_crystal_fragment',
        ],
        patterns: ['mna:circle', 'mna:diamond', 'mna:square', 'mna:diamond', 'mna:circle', 'mna:square'],
    })
})
