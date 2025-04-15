// requires: irons_spellbooks
// requires: irons_spells_js
{
    // let SpellRegistry = Java.loadClass('io.redspace.ironsspellbooks.api.registry.SpellRegistry') // since iron's spells js needed
    let AttackSpells = [
        // rand pool
        SpellRegistry.MAGIC_MISSILE_SPELL,
        // SpellRegistry.LOB_CREEPER_SPELL,
        SpellRegistry.FIREBOLT_SPELL,
        // SpellRegistry.FIRECRACKER_SPELL,
        SpellRegistry.ELDRITCH_BLAST_SPELL,
        SpellRegistry.ACUPUNCTURE_SPELL,
        // SpellRegistry.TELEPORT_SPELL, // no, crashed once
        SpellRegistry.CHAIN_LIGHTNING_SPELL,
        SpellRegistry.ROOT_SPELL,
    ]

    let fightBackTargetInvalidCheckLive = (entity, actual) => actual.health <= 0
    let fightBackTargetInvalidCheck = (entity, actual) =>
        actual == null ||
        actual.type === entity.type ||
        (actual.isPlayer() && (actual.creative || actual.spectator)) ||
        fightBackTargetInvalidCheckLive(entity, actual)
    /**
     * @param {Internal.Villager} entity
     * @param {Internal.RegistryObject<Internal.AbstractSpell>} spellHolder
     */
    let forceCast = (entity, spellHolder, target) => {
        let spell = spellHolder.get()
        let canForceCast = spell.castType != 'continuous'

        if (canForceCast) {
            let { magicData, level } = entity
            if (target) {
                magicData.additionalCastData = TargetEntityCastData(target)
                entity.lookAt(target, 180, 180)
            }
            spell.onCast(level, spell.maxLevel, entity, 'mob', magicData)
        } else {
            entity.initiateCastSpell(spell, spell.maxLevel)
        }
    }

    /**
     * @param {Internal.Villager} entity
     * @param {Internal.Entity} actual
     * @param {number} angerLevel
     */
    let villagerFightBack = (entity, actual) => {
        let { server } = entity

        // no too frequent trigger
        let { lastAttackTick } = entity.persistentData
        let nowTick = entity.age // well...
        let delta = nowTick - (lastAttackTick || 0)
        if (delta > 0 && delta < 10) return
        entity.persistentData.lastAttackTick = nowTick
        let anger = 10,
            targetInvalidChecker = fightBackTargetInvalidCheck

        // modules
        let invalidCheck = () => {
            return entity.health <= 0 || entity.persistentData.lastAttackTick !== nowTick
        }
        let tryAttack = () => {
            if (invalidCheck() || targetInvalidChecker(entity, actual)) return
            targetInvalidChecker = fightBackTargetInvalidCheckLive
            entity.target = actual
            for (let i = 2; i <= 10; i += 2)
                entity.server.scheduleInTicks(i, () => {
                    if (invalidCheck()) return
                    forceCast(entity, AttackSpells[Math.floor(Math.random() * AttackSpells.length)], actual)
                })

            // heal after attack
            server.scheduleInTicks(11, tryHealAndEnd)

            // repeat attack
            if (anger > 0) {
                anger--
                server.scheduleInTicks(20, tryAttack)
            }

            return true
        }
        let tryHealAndEnd = () => {
            if (invalidCheck() || entity.maxHealth === entity.health) return
            entity.target = null
            forceCast(entity, SpellRegistry.CLOUD_OF_REGENERATION_SPELL)
            if (entity.health / entity.maxHealth < 0.5) forceCast(entity, SpellRegistry.EVASION_SPELL)
        }

        // buff
        forceCast(entity, SpellRegistry.OAKSKIN_SPELL)
        forceCast(entity, SpellRegistry.CHARGE_SPELL)

        // attack & heal
        if (!tryAttack()) server.scheduleInTicks(1, tryHealAndEnd)
    }

    EntityEvents.hurt('villager', ev => {
        let {
            entity,
            level,
            source: { actual },
        } = ev

        villagerFightBack(entity, actual)
        if (fightBackTargetInvalidCheck(entity, actual)) return
        for (let nearby of level.getEntitiesWithin(actual.boundingBox.inflate(20))) {
            if (nearby.type !== entity.type) continue
            villagerFightBack(nearby, actual)
        }
    })
    EntityEvents.death('villager', ev => {
        let { entity, source, level } = ev
        level.tell(source.getLocalizedDeathMessage(entity))
    })
}
