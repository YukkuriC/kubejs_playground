// requires: irons_spellbooks
{
    let Villager = Java.loadClass('net.minecraft.world.entity.npc.Villager')
    let SpellRegistry = Java.loadClass('io.redspace.ironsspellbooks.api.registry.SpellRegistry')

    ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingEvent$LivingTickEvent', ev => {
        let { entity } = ev
        if (!(entity instanceof Villager)) return
        if (entity.age % 100 || entity.maxHealth - entity.health < 4) return
        entity.initiateCastSpell(SpellRegistry.CLOUD_OF_REGENERATION_SPELL.get(), 9)
    })
    ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingHurtEvent', ev => {
        let { entity } = ev
        if (!(entity instanceof Villager)) return
        entity.initiateCastSpell(SpellRegistry.OAKSKIN_SPELL.get(), 9)
    })
}
