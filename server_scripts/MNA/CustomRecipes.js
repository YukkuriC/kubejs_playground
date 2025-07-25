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
})
