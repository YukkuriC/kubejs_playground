StartupEvents.postInit(e => {
    let BrewingRecipeRegistry = Java.tryLoadClass('net.neoforged.neoforge.common.brewing.BrewingRecipeRegistry')
    if (!BrewingRecipeRegistry) return

    BrewingRecipeRegistry.addRecipe('dirt', 'snowball', 'grass_block')
})
