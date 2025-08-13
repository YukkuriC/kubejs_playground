// requires: mna
ServerEvents.recipes(e => {
    let tryTag = (item, count) => {
        // already json obj, give up
        if (item.get) return item
        if (item.getAsString) item = item.asString

        let test = Item.of(item)
        let res = {}
        res[test.empty ? 'tag' : 'item'] = item
        if (count) res.count = count
        return res
    }

    // auto rune patterns
    e.forEachRecipe({ type: 'mna:runescribing' }, recipe => {
        let target = recipe.json.get('output').asString
        e.shapeless(target, [
            Item.of('mna:runescribing_recipe_paper', { runescribe_recipe_id: String(recipe.id) }).strongNBT(),
            'blaze_rod',
            'mna:rune_pattern',
        ]).keepIngredient('mna:runescribing_recipe_paper')
    })
    if (Platform.isLoaded('create')) {
        // auto crushing
        e.forEachRecipe({ type: 'mna:crushing' }, recipe => {
            let raw = recipe.json
            let res = [tryTag(raw.get('output'), raw.get('output_quantity'))]
            let byproducts = raw.get('byproducts')
            if (byproducts)
                byproducts.asJsonArray.forEach(e => {
                    res.push(tryTag(e, e.get('rolls')))
                })
            e.custom({
                type: 'create:crushing',
                ingredients: [tryTag(raw.get('input'))],
                processingTime: 150,
                results: res,
            })
        })
        // auto forging
        e.forEachRecipe({ type: 'mna:runeforging' }, recipe => {
            let raw = recipe.json

            let res = [tryTag(raw.get('output'), raw.get('output_quantity'))]
            let byproducts = raw.get('byproducts')
            if (byproducts) byproducts.asJsonArray.forEach(e => res.push(tryTag(e)))

            let inputs = [tryTag(raw.get('pattern'))]
            let material = raw.get('material')?.asString || 'mna:superheated_vinteum_ingot'
            inputs.push(tryTag(material))

            e.custom({
                type: 'create:compacting',
                ingredients: inputs,
                results: res,
            })
        })
        // auto manaweaving
        e.forEachRecipe({ type: 'mna:manaweaving-recipe' }, recipe => {
            let raw = recipe.json

            let res = [tryTag(raw.get('output'), raw.get('quantity'))]
            let byproducts = raw.get('byproducts')
            if (byproducts) byproducts.forEach(e => res.push(tryTag(e)))

            let inputs = []
            raw.get('items').forEach(x => inputs.push(tryTag(x)))

            e.custom({
                type: 'create:mixing',
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
