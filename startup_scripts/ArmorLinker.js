{
    let Arrays = Java.loadClass('java.util.Arrays')

    let ARS = {}
    for (let cls of [
        'com.hollingsworth.arsnouveau.api.perk.ArmorPerkHolder',
        'com.hollingsworth.arsnouveau.api.registry.PerkRegistry',
        'com.hollingsworth.arsnouveau.setup.registry.ItemsRegistry',
        'com.hollingsworth.arsnouveau.api.util.PerkUtil',
        'com.hollingsworth.arsnouveau.api.perk.PerkSlot',
    ]) {
        let tmp = cls.split(/\./g)
        tmp = tmp.pop()
        ARS[tmp] = Java.loadClass(cls)
    }
    global.ARS = ARS

    let MEK = {
        MekanismItems: Java.loadClass('mekanism.common.registries.MekanismItems'),
    }

    StartupEvents.postInit(e => {
        for (let item of [
            MEK.MekanismItems.MEKASUIT_HELMET,
            MEK.MekanismItems.MEKASUIT_BODYARMOR,
            MEK.MekanismItems.MEKASUIT_PANTS,
            MEK.MekanismItems.MEKASUIT_BOOTS,
        ]) {
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
}
