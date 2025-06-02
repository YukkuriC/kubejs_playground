// requires: irons_spellbooks
// requires: irons_spells_js
{
    // let SpellRegistry = Java.loadClass('io.redspace.ironsspellbooks.api.registry.SpellRegistry') // since iron's spells js needed
    let AttackSpells = [
        // rand pool
        SpellRegistry.MAGIC_MISSILE_SPELL,
        SpellRegistry.GUIDING_BOLT_SPELL,
        // SpellRegistry.LOB_CREEPER_SPELL,
        SpellRegistry.FIREBOLT_SPELL,
        // SpellRegistry.FIRECRACKER_SPELL,
        SpellRegistry.ELDRITCH_BLAST_SPELL,
        SpellRegistry.ACUPUNCTURE_SPELL,
        // SpellRegistry.TELEPORT_SPELL, // no, crashed once
        // SpellRegistry.CHAIN_LIGHTNING_SPELL, // too dangerous for player
        SpellRegistry.ROOT_SPELL,
    ]
    let typeBlacklist = new Set(['minecraft:villager', 'minecraft:iron_golem', 'irons_spellbooks:priest'])
    let UNDYING_CD = 60 * 20

    let fightBackTargetInvalidCheckLive = (entity, actual) => !actual.alive
    let fightBackTargetInvalidCheck = (entity, actual) =>
        actual == null ||
        !actual.living ||
        typeBlacklist.has(String(actual.type)) ||
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
    let villagerFightBack = (entity, actual, ticksAfterLastAttack, angryLoop) => {
        let { server } = entity

        // no too frequent trigger
        ticksAfterLastAttack = ticksAfterLastAttack || 10
        let { lastAttackTick } = entity.persistentData
        let nowTick = entity.age // well...
        let delta = nowTick - (lastAttackTick || 0)
        if (delta > 0 && delta < ticksAfterLastAttack) return
        entity.persistentData.lastAttackTick = nowTick
        let anger = angryLoop || 10,
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
        let potions = entity.potionEffects
        if (potions.getDuration('irons_spellbooks:oakskin') < 200) forceCast(entity, SpellRegistry.OAKSKIN_SPELL)
        if (potions.getDuration('irons_spellbooks:charged') < 200) forceCast(entity, SpellRegistry.CHARGE_SPELL)

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

    // DLC: assassination contract
    ItemEvents.rightClicked('emerald', e => {
        let { player, level, item, hand } = e
        if (!player.shiftKeyDown) return
        player.swing(hand)
        let { entity } = player.rayTrace(32, false)
        if (entity && (entity.isPlayer() || fightBackTargetInvalidCheck(player, entity))) entity = null
        let contractAccepted = false
        for (let nearby of level.getEntitiesWithin(player.boundingBox.inflate(30))) {
            if (nearby.type !== 'minecraft:villager') continue
            villagerFightBack(nearby, entity)
            contractAccepted = contractAccepted || Boolean(entity)
        }
        if (contractAccepted && !player.isCreative()) item.shrink(1)
    })
    EntityEvents.death('villager', ev => {
        let { entity, source, level } = ev
        let undyingInterval = entity.age - (entity.persistentData.undyingTick || -114514)
        if (undyingInterval < UNDYING_CD) {
            level.tell(source.getLocalizedDeathMessage(entity))
            return
        }
        entity.persistentData.undyingTick = entity.age

        entity.health = 1
        entity.removeAllEffects()
        let potion = entity.potionEffects
        potion.add('regeneration', 900, 1)
        potion.add('absorption', 100, 1)
        potion.add('fire_resistance', 800)
        level.broadcastEntityEvent(entity, 35)
        ev.cancel()
    })

    // DLC: actively fight back
    let MeleeAttackGoal = Java.loadClass('net.minecraft.world.entity.ai.goal.MeleeAttackGoal')
    let NearestAttackableTargetGoal = Java.loadClass('net.minecraft.world.entity.ai.goal.target.NearestAttackableTargetGoal')
    let Enemy = Java.loadClass('net.minecraft.world.entity.monster.Enemy')
    let Raider = Java.loadClass('net.minecraft.world.entity.raid.Raider')
    let Mob = Java.loadClass('net.minecraft.world.entity.Mob')
    let trackingDistSq = 1024
    EntityEvents.spawned(e => {
        let { entity } = e
        if (entity.type != 'minecraft:villager') return
        delete entity.persistentData.undyingTick
        entity.targetSelector.addGoal(
            4,
            new NearestAttackableTargetGoal(entity, Mob, 40, true, false, t => {
                if (!(t instanceof Enemy)) return false
                if (t.target === entity || t instanceof Raider) return true
                return !fightBackTargetInvalidCheck(entity, t) && entity.getPerceivedTargetDistanceSquareForMeleeAttack(t) <= trackingDistSq
            }),
        )
        const customAttacker = new JavaAdapter(
            MeleeAttackGoal,
            {
                // checkAndPerformAttack
                m_6739_() {
                    let { target } = entity
                    if (!target) return
                    villagerFightBack(entity, target, 20, 3)
                },
            },
            entity,
            1,
            true,
        )
        entity.goalSelector.addGoal(1, customAttacker)
    })
}
