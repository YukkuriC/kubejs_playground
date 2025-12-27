StartupEvents.postInit(e => {
    let BrewingRecipeRegistry = Java.tryLoadClass('net.minecraftforge.common.brewing.BrewingRecipeRegistry')
    if (!BrewingRecipeRegistry) return

    BrewingRecipeRegistry.addRecipe('dirt', 'snowball', 'grass_block')
})
