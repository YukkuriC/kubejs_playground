ServerEvents.recipes(e => {
    let gcd = (a, b) => {
        if (a <= b) [a, b] = [b, a]
        if (a % b == 0) return b
        return gcd(b, a % b)
    }
    let HAS_CREATE = Platform.isLoaded('create')

    // illumination transformation
    {
        /**@type {Internal.RecipeJS[]}*/
        let luminRecipes = []
        e.forEachRecipe({ type: 'magichem:illumination' }, r => luminRecipes.push(r))
        let recipeJsonCache = {}
        let srcLumins = {}
        let srcLuminItems = {}
        for (let r of luminRecipes) {
            let raw = JSON.parse(r.json.toString())
            recipeJsonCache[r.id] = raw
            if (raw.input != 'magichem:glass_orb') continue
            srcLumins[raw.lumins.type] = raw.lumins.minutes
            srcLuminItems[raw.lumins.type] = raw.result.item
        }
        for (let r of luminRecipes) {
            let raw = recipeJsonCache[r.id]
            if (raw.input == 'magichem:glass_orb') continue

            // calc counts
            let srcPower = raw.result.count * srcLumins[raw.lumins.type]
            let dstPower = raw.lumins.minutes
            let gp = gcd(srcPower, dstPower)
            let minTotal = (srcPower * dstPower) / gp
            let countOrb = minTotal / srcPower,
                countRes = minTotal / dstPower

            let use_fallback = true
            if (HAS_CREATE) {
                use_fallback = false
                let ingredients = Array(countOrb).fill({ item: srcLuminItems[raw.lumins.type] })
                ingredients.push.apply(
                    ingredients,
                    Array(countRes).fill({
                        item: raw.input,
                    }),
                )
                e.custom({
                    type: 'create:mixing',
                    ingredients: ingredients,
                    results: [
                        {
                            item: raw.result.item,
                            count: countRes,
                        },
                        {
                            item: 'magichem:glass_orb',
                            count: countOrb,
                        },
                    ],
                    heatRequirement: 'superheated',
                }).id(r.id + '/create')
            }
            if (use_fallback) {
                e.shapeless(Item.of(raw.result.item, countRes), [
                    Item.of(srcLuminItems[raw.lumins.type], countOrb),
                    Item.of(raw.input, countRes),
                ]).id(r.id + '/fallback')
            }
        }
    }
})
