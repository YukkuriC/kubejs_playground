// requires: magichem

{
    let DistillationFabricationRecipe = Java.loadClass('com.aranaira.magichem.recipe.DistillationFabricationRecipe')

    let cache = {}
    /** @type {Record<string,Internal.Recipe<any>>} */
    let recipes = null
    let buildRecipeMap = () => {
        recipes = {}
        for (let r of DistillationFabricationRecipe.getAllDistillingRecipes(Client.level)) {
            let output = r.getResultItem(null)
            recipes[output.id] = r
        }
    }
    let getDescripFor = stack => {
        if (stack.id in cache) return cache[stack.id]

        if (!recipes) buildRecipeMap()

        let recipe = recipes[stack.id]
        if (!recipe) {
            return (cache[stack.id] = null)
        }
        let inner = Text.aqua('')
        let ret = Text.darkGray('= [').append(inner).append(']')
        let first = true
        for (let m of recipe.componentMateria) {
            let { item, count } = m
            let mid = Text.translate(`item.magichem.${item.getEssentiaWheel ? 'essentia' : 'admixture'}_${item.materiaName}.truncated`)
            if (count > 1) mid = mid.append(MagiChemLib.toSmallNum(count))
            if (first) first = false
            else inner = inner.append(' ')
            inner = inner.append(mid)
        }
        if (recipe.outputRate < 1) ret = ret.append(` (${Math.round(recipe.outputRate * 1000) / 10}%)`)
        return (cache[stack.id] = ret)
    }

    ClientEvents.loggedIn(e => {
        cache = {}
        recipes = null
    })

    ItemEvents.tooltip(e => {
        e.addAdvancedToAll((stack, advanced, tooltips) => {
            try {
                let line = getDescripFor(stack)
                if (line) tooltips.add(line)
            } catch (e) {
                tooltips.add(Text.of(String(e)))
            }
        })
    })
}
