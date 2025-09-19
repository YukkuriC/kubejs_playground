{
    let ALL_COLORS = [
        'red',
        'orange',
        'yellow',
        'lime',
        'green',
        'cyan',
        'light_blue',
        'blue',
        'purple',
        'magenta',
        'pink',
        'brown',
        'black',
        'gray',
        'light_gray',
        'white',
    ]
    let buildColorRecipe = (pattern, colorless, mod_required) => {
        let recipe = {
            type: 'magichem:coloration',
            charge_usage: 1,
            crafting_time_multiplier: 1.0,
            valid_on_cauldron: true,
            valid_on_variegator: true,
            colorless_default: {
                item: colorless,
            },
            outputs: [],
        }
        for (let color of ALL_COLORS) {
            recipe.outputs.push({
                color: color,
                item: pattern.replace('@', color),
            })
        }

        if (mod_required) {
            recipe = {
                type: 'forge:conditional',
                recipes: [
                    {
                        conditions: [
                            {
                                type: 'forge:mod_loaded',
                                modid: mod_required,
                            },
                        ],
                        recipe: recipe,
                    },
                ],
            }
        }

        // dump
        // JsonIO.write(`dump/data/${mod_required || 'magichem'}/recipes/coloration/${colorless.replace(':', '_')}.json`, recipe)

        return recipe
    }

    let recipesToAdd = []
    if (Platform.isLoaded('ae2')) {
        for (let type of ['glass', 'smart', 'dense', 'smart_dense', 'covered', 'covered_dense']) {
            let template = `ae2:@_${type}_cable`
            recipesToAdd.push(buildColorRecipe(template, template.replace('@', 'fluix'), 'ae2'))
        }
        recipesToAdd.push(buildColorRecipe('ae2:@_paint_ball', 'ae2:matter_ball', 'ae2'))
        recipesToAdd.push(buildColorRecipe('ae2:@_lumen_paint_ball', 'ae2:white_lumen_paint_ball', 'ae2'))
    }

    ServerEvents.recipes(e => {
        for (let r of recipesToAdd) e.custom(r)
    })
}
