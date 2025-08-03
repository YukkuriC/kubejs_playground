// requires: goety
ServerEvents.recipes(e => {
    e.forEachRecipe({ type: 'goety:brazier' }, recipe => {
        let raw = recipe.json
        let target = raw.get('result').get('item').asString
        let ingredients = []
        raw.get('ingredients').asJsonArray.forEach(i => ingredients.push(i.get('item').asString))
        let cost = raw.get('soulCost').asDouble
        while (!(cost <= 0) /** prevent NaN */) {
            cost -= 500
            ingredients.push('echo_shard')
        }

        e.shapeless(target, ingredients)
    })
})
