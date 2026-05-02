// requires: unsafejs
{
    let BeaconBlockEntity = Java.loadClass('net.minecraft.world.level.block.entity.BeaconBlockEntity')
    let AllEffects = Java.loadClass(
        'net.minecraft.core.' + (Platform.getMcVersion() >= '1.20' ? 'registries.BuiltInRegistries' : 'Registry'),
    ).MOB_EFFECT
    let ArrayList = Java.loadClass('java.util.ArrayList')
    let HashSet = Java.loadClass('java.util.HashSet')

    StartupEvents.postInit(e => {
        let original = BeaconBlockEntity.BEACON_EFFECTS
        let mutable = []
        for (let i = 0; i < 4; i++) mutable[i] = Array.from(original[i].toArray())

        // add effects
        mutable[0].push(AllEffects.getHolder('night_vision').get())
        mutable[1].push(AllEffects.getHolder('bad_omen').get())
        if (Platform.isLoaded('hexcasting')) {
            mutable[2].push(AllEffects.getHolder('hexcasting:enlarge_grid').get())
        }
        if (Platform.isLoaded('ars_nouveau')) {
            mutable[2].push(AllEffects.getHolder('ars_nouveau:mana_regen').get())
        }
        if (Platform.isLoaded('irons_spellbooks')) {
            mutable[2].push(AllEffects.getHolder('irons_spellbooks:echoing_strikes').get())
        }

        // update effects back
        let originalReplaced = new ArrayList()
        for (let arr of mutable) {
            let sub = new ArrayList()
            for (let eff of arr) sub.add(eff)
            originalReplaced.add(sub)
        }
        Unsafe.setField(BeaconBlockEntity, 'BEACON_EFFECTS', originalReplaced)

        // update validation
        let flattened = []
        for (let sub of mutable) flattened.push.apply(flattened, sub)
        flattened = new HashSet(flattened)
        Unsafe.setField(BeaconBlockEntity, 'VALID_EFFECTS', flattened)
    })
}
