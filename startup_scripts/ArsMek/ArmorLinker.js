// requires: mekanism
// requires: ars_nouveau

{
    let Arrays = Java.loadClass('java.util.Arrays')

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
        'com.hollingsworth.arsnouveau.api.perk.ArmorPerkHolder',
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

    let PS4 = new ARS.PerkSlot(new ResourceLocation(ARS.ArsNouveau.MODID, 'four'), 4)
    StartupEvents.postInit(e => {
        for (let item of MEK.SUIT_BASE()) {
            ARS.PerkRegistry.registerPerkProvider(
                item,
                stack =>
                    new ARS.ArmorPerkHolder(
                        stack,
                        Arrays.asList(
                            Arrays.asList(ARS.PerkSlot.ONE),
                            Arrays.asList(ARS.PerkSlot.ONE, ARS.PerkSlot.TWO),
                            Arrays.asList(ARS.PerkSlot.TWO, ARS.PerkSlot.THREE, PS4),
                        ),
                    ),
            )
        }
        ARS.SUIT = ARS.SUIT_BASE().map(x => x.get())
    })

    let target_slot = {
        'mekanism:mekasuit_helmet': 3,
        'mekanism:mekasuit_bodyarmor': 2,
        'mekanism:mekasuit_pants': 1,
        'mekanism:mekasuit_boots': 0,
    }

    ForgeEvents.onEvent('net.minecraftforge.event.ItemAttributeModifierEvent', e => global.InjectMekasuit(e))
    global.InjectMekasuit = (/**@type {Internal.ItemAttributeModifierEvent}*/ e) => {
        let { itemStack, slotType: slot } = e
        if (target_slot[itemStack.id] !== slot.index) return

        let attrMap = ARS.SUIT[slot.getIndex()].getAttributeModifiers(slot, itemStack)
        for (let pair of attrMap.entries()) {
            let { key, value } = pair
            if (value.name.startsWith('Armor ')) {
                continue
            }
            e.addModifier(key, value)
        }
    }
}
