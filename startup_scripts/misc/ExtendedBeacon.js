{
    let BeaconBlockEntity = Java.loadClass('net.minecraft.world.level.block.entity.BeaconBlockEntity')
    let AllEffects = Java.loadClass(
        'net.minecraft.core.' + (Platform.getMcVersion() >= '1.20' ? 'registries.BuiltInRegistries' : 'Registry'),
    ).MOB_EFFECT
    let HashSet = Java.loadClass('java.util.HashSet')

    StartupEvents.postInit(e => {
        let original = BeaconBlockEntity.BEACON_EFFECTS
        let mutable = []
        for (let i = 0; i < 4; i++) mutable[i] = Array.from(original[i])

        // add effects
        mutable[0].push(AllEffects.get('night_vision'))
        mutable[1].push(AllEffects.get('bad_omen'))
        if (Platform.isLoaded('hexcasting')) {
            mutable[2].push(AllEffects.get('hexcasting:enlarge_grid'))
        }
        if (Platform.isLoaded('ars_nouveau')) {
            mutable[2].push(AllEffects.get('ars_nouveau:mana_regen'))
        }

        // update effects back
        for (let i = 0; i < 4; i++) original[i] = mutable[i]

        // update validation
        let flattened = []
        for (let sub of mutable) flattened.push.apply(flattened, sub)
        flattened = new HashSet(flattened)
        global.unsafeSetField(BeaconBlockEntity, /*VALID_EFFECTS*/ 'f_58647_', flattened, 1)
    })
}
