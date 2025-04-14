// requires: irons_spellbooks
// requires: irons_spells_js
{
    // let SpellRegistry = Java.loadClass('io.redspace.ironsspellbooks.api.registry.SpellRegistry') // since iron's spells js needed
    let AttackSpells = [
        // rand pool
        SpellRegistry.MAGIC_MISSILE_SPELL,
        SpellRegistry.LOB_CREEPER_SPELL,
        SpellRegistry.FIREBOLT_SPELL,
        SpellRegistry.FIRECRACKER_SPELL,
        SpellRegistry.ELDRITCH_BLAST_SPELL,
    ]

    EntityEvents.hurt('villager', ev => {
        let {
            entity,
            source: { actual },
        } = ev

        // buff
        entity.initiateCastSpell(SpellRegistry.OAKSKIN_SPELL.get(), 10)

        // attack
        if (actual != null && actual.type !== entity.type) {
            entity.target = actual
            for (let i = 2; i <= 10; i += 2)
                entity.server.scheduleInTicks(i, () => {
                    entity.initiateCastSpell(AttackSpells[Math.floor(Math.random() * AttackSpells.length)].get(), 10)
                })
        }

        // heal
        entity.server.scheduleInTicks(11, () => {
            if (entity.maxHealth != entity.health) return
            entity.initiateCastSpell(SpellRegistry.CLOUD_OF_REGENERATION_SPELL.get(), 10)
        })
    })
}
