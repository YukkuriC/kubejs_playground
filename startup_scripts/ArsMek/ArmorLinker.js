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
                            Arrays.asList(ARS.PerkSlot.ONE, ARS.PerkSlot.TWO, ARS.PerkSlot.THREE),
                        ),
                    ),
            )
        }
    })

    // backup update
    // ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingEquipmentChangeEvent', e => {
    //     const { slot, from, to } = e
    //     if (slot.armor && from.id != to.id && to.id.startsWith('mekanism:mekasuit_')) global.InjectMekasuit(to, slot)
    // })
}
