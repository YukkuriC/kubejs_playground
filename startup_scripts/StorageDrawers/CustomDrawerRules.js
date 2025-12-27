// requires: storagedrawers

StartupEvents.postInit(() => {
    let Tiers
    try {
        Tiers = Java.loadClass('com.jaquadro.minecraft.storagedrawers.config.CompTierRegistry').INSTANCE
    } catch (e) {
        Tiers = Java.loadClass('com.jaquadro.minecraft.storagedrawers.StorageDrawers').compRegistry
    }

    Tiers.register('amethyst_block', 'amethyst_shard', 4)
    Tiers.register('packed_ice', 'ice', 9)
    Tiers.register('blue_ice', 'packed_ice', 9)
    Tiers.register('white_wool', 'string', 4)
    Tiers.register('magma_block', 'magma_cream', 4)
    if (Platform.isLoaded('hexcasting')) {
        Tiers.register('hexcasting:quenched_allay', 'hexcasting:quenched_allay_shard', 4)
    }
})
