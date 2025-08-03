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
    if (Platform.isLoaded('create'))
        e.forEachRecipe({ type: 'mna:crushing' }, recipe => {
            let raw = recipe.json
            let res = [
                {
                    count: raw.get('output_quantity').asDouble,
                    item: raw.get('output').asString,
                },
            ]
            let byproducts = raw.get('byproducts')
            if (byproducts) byproducts.asJsonArray.forEach(e => res.push(e))
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
