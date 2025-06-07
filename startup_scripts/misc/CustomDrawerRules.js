// requires: storagedrawers

try {
    let Tiers
    try {
        Tiers = Java.loadClass('com.jaquadro.minecraft.storagedrawers.config.CompTierRegistry').INSTANCE
    } catch (e) {
        Tiers = Java.loadClass('com.jaquadro.minecraft.storagedrawers.StorageDrawers').compRegistry
    }

    Tiers.register('amethyst_block', 'amethyst_shard', 4)
    Tiers.register('bedrock', 'dirt', 64)
} catch (e) {
    if (Utils.server) Utils.server.tell(e)
    console.error(e)
}
