/** @type [Special.MobEffect, number][] */
const buffsToAdd = [
    ['minecraft:luck', 5],
    // ['cold_sweat:grace', 5],
]

/* ForgeEvents.onEvent('net.minecraftforge.event.entity.living.MobEffectEvent$Added', e => {
    const self = e.getEntity()
    const effect = e.getEffectInstance()
    if (!self.isPlayer()) return
    if (effect.descriptionId === 'effect.minecraft.regeneration' && effect.duration == 340 && effect.amplifier == 0) {
        let pool = self.potionEffects
        for (const [id, lvl] of buffsToAdd) {
            pool.add(id, 340, lvl - 1, true, true)
        }
    }
})*/
