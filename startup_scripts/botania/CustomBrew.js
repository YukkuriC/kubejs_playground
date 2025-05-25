{
    let Brew = Java.loadClass('vazkii.botania.api.brew.Brew')
    let MobEffectInstance = Java.loadClass('net.minecraft.world.effect.MobEffectInstance')

    let cachedGet = getter => {
        let cached = null
        return () => {
            if (!cached) cached = getter()
            return cached
        }
    }

    StartupEvents.registry('botania:brews', e => {
        e.createCustom(
            'worse_omen',
            cachedGet(() => new Brew(0x777777, 4000, new MobEffectInstance('bad_omen', 1800, 9))),
        )
        if (Platform.isLoaded('irons_spellbooks')) {
            e.createCustom(
                'charged',
                cachedGet(() => new Brew(0x3366ff, 4000, new MobEffectInstance('irons_spellbooks:charged', 1800, 9))),
            )
        }
    })
}
