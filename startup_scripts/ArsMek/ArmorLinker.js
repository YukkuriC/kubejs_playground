// requires: mekanism
// requires: ars_nouveau

{
    let Arrays = Java.loadClass('java.util.Arrays')
    let ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')

    let ARS = {
        SUIT_BASE: () => [
            ARS.ItemsRegistry.BATTLEMAGE_BOOTS,
            ARS.ItemsRegistry.BATTLEMAGE_LEGGINGS,
            ARS.ItemsRegistry.BATTLEMAGE_ROBES,
            ARS.ItemsRegistry.BATTLEMAGE_HOOD,
        ],
    }
    for (let cls of [
        'com.hollingsworth.arsnouveau.ArsNouveau',
        'com.hollingsworth.arsnouveau.api.registry.PerkRegistry',
        'com.hollingsworth.arsnouveau.setup.registry.ItemsRegistry',
        'com.hollingsworth.arsnouveau.api.perk.PerkSlot',
    ]) {
        let tmp = cls.split(/\./g)
        tmp = tmp.pop()
        ARS[tmp] = Java.loadClass(cls)
    }
    global.ARS = ARS

    let MEK = {
        MekanismItems: Java.loadClass('mekanism.common.registries.MekanismItems'),
        SUIT_BASE: () => [
            MEK.MekanismItems.MEKASUIT_BOOTS,
            MEK.MekanismItems.MEKASUIT_PANTS,
            MEK.MekanismItems.MEKASUIT_BODYARMOR,
            MEK.MekanismItems.MEKASUIT_HELMET,
        ],
    }
    global.MEK = MEK

    let PS4 = new ARS.PerkSlot(ResourceLocation.fromNamespaceAndPath(ARS.ArsNouveau.MODID, 'four'), 4)
    StartupEvents.postInit(e => {
        for (let item of MEK.SUIT_BASE()) {
            ARS.PerkRegistry.registerPerkProvider(
                item,
                Arrays.asList(
                    Arrays.asList(ARS.PerkSlot.ONE),
                    Arrays.asList(ARS.PerkSlot.ONE, ARS.PerkSlot.TWO),
                    Arrays.asList(ARS.PerkSlot.TWO, ARS.PerkSlot.THREE, PS4),
                ),
            )
        }
    })

    let target_slot = {
        'mekanism:mekasuit_helmet': 3,
        'mekanism:mekasuit_bodyarmor': 2,
        'mekanism:mekasuit_pants': 1,
        'mekanism:mekasuit_boots': 0,
    }

    NativeEvents.onEvent('net.neoforged.neoforge.event.ItemAttributeModifierEvent', e => global.InjectMekasuit(e))
    global.InjectMekasuit = (/**@type {Internal.$ItemAttributeModifierEvent}*/ e) => {
        let { itemStack } = e
        let slot = target_slot[itemStack.id]
        if (slot === undefined) return
        if (!ARS.SUIT) ARS.SUIT = ARS.SUIT_BASE().map(x => x.get())

        let attrMap = ARS.SUIT[slot].getDefaultAttributeModifiers(itemStack)
        for (let pair of attrMap.modifiers()) {
            e.addModifier(pair.attribute(), pair.modifier(), pair.slot())
        }
    }
}
