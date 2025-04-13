// requires: irons_spellbooks
{
    let Villager = Java.loadClass('net.minecraft.world.entity.npc.Villager')
    let SpellRegistry = Java.loadClass('io.redspace.ironsspellbooks.api.registry.SpellRegistry')
    let AttackSpells = [
        // rand pool
        SpellRegistry.MAGIC_MISSILE_SPELL,
        SpellRegistry.LOB_CREEPER_SPELL,
        SpellRegistry.FIREBOLT_SPELL,
    ]

    ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingEvent$LivingTickEvent', ev => {
        let { entity } = ev
        if (!(entity instanceof Villager)) return
        // global.villagerOnTick(entity)
        if (entity.age % 100 || entity.maxHealth - entity.health < 4) return
        entity.initiateCastSpell(SpellRegistry.CLOUD_OF_REGENERATION_SPELL.get(), 10)
    })
    ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingHurtEvent', ev => {
        let {
            entity,
            source: { actual },
        } = ev
        if (!(entity instanceof Villager)) return
        // global.villagerOnHurt(entity, actual)
        entity.initiateCastSpell(SpellRegistry.OAKSKIN_SPELL.get(), 10)
        if (src != null && !(src instanceof Villager)) {
            for (let i = 2; i <= 10; i += 2)
                entity.server.scheduleInTicks(i, () => {
                    entity.lookAt(src, 180, 180)
                    let rand = Math.floor(Math.random() * AttackSpells.length)
                    entity.initiateCastSpell(AttackSpells[rand].get(), 10)
                })
        }
    })
    // /** @param {Internal.Villager} entity */
    // global.villagerOnHurt = (entity, src) => {}
    // /** @param {Internal.Villager} entity */
    // global.villagerOnTick = entity => {}
}
