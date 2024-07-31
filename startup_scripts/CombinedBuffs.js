/** @type [Special.MobEffect, number][] */
const buffsToAdd = [
    ['minecraft:luck', 5],
    // ['cold_sweat:grace', 5],
]

ForgeEvents.onEvent('net.minecraftforge.event.entity.living.MobEffectEvent$Added', e => {
    const self = e.getEntity()
    const effect = e.getEffectInstance()
    if (!(self instanceof $Player)) return
    if (effect.descriptionId === 'effect.minecraft.regeneration' && effect.duration == 340 && effect.amplifier == 0) {
        for (const [id, lvl] of buffsToAdd) {
            const newEffect = new $MobEffectInstance(
                id,
                340, // duration ticks
                lvl - 1, // amplifier = (level - 1)
                true, // ambient?
                true, // show in hud?
            )
            self.addEffect(newEffect, self)
        }
    }
})
