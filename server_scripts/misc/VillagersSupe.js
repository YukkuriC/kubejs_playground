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
            server,
        } = ev

        let { lastAttackTick } = entity.persistentData
        let nowTick = server.tickCount
        if (nowTick - (lastAttackTick || 0) < 10) return
        entity.persistentData.lastAttackTick = nowTick

        // modules
        let invalidCheck = () => {
            return entity.health <= 0 || entity.persistentData.lastAttackTick !== nowTick
        }
        let tryAttack = () => {
            if (invalidCheck()) return
            if (actual == null || actual.type === entity.type || (actual.isPlayer() && (actual.creative || actual.spectator))) return
            entity.target = actual
            for (let i = 2; i <= 10; i += 2)
                entity.server.scheduleInTicks(i, () => {
                    if (invalidCheck()) return
                    entity.initiateCastSpell(AttackSpells[Math.floor(Math.random() * AttackSpells.length)].get(), 10)
                })

            // heal after attack
            server.scheduleInTicks(11, tryHeal)
            return true
        }
        let tryHeal = () => {
            if (invalidCheck() || entity.maxHealth === entity.health) return
            entity.target = null
            entity.initiateCastSpell(SpellRegistry.CLOUD_OF_REGENERATION_SPELL.get(), 10)
        }

        // buff
        entity.initiateCastSpell(SpellRegistry.OAKSKIN_SPELL.get(), 10)

        // attack & heal
        if (!tryAttack()) server.scheduleInTicks(1, tryHeal)
    })
}
