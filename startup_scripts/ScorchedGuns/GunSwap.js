// requires: scguns

{
    let ProjectileManager = Java.loadClass('top.ribs.scguns.common.ProjectileManager')
    let ModEntities = Java.loadClass('top.ribs.scguns.init.ModEntities')
    let ModItems = Java.loadClass('top.ribs.scguns.init.ModItems')
    let ModParticleTypes = Java.loadClass('top.ribs.scguns.init.ModParticleTypes')

    let PlasmaProjectileEntity = Java.loadClass('top.ribs.scguns.entity.projectile.PlasmaProjectileEntity')
    let SculkCellEntity = Java.loadClass('top.ribs.scguns.entity.projectile.SculkCellEntity')
    let LightningProjectileEntity = Java.loadClass('top.ribs.scguns.entity.projectile.LightningProjectileEntity')
    let ProjectileEntity = Java.loadClass('top.ribs.scguns.entity.projectile.ProjectileEntity')

    let ParticleTypes = Java.loadClass('net.minecraft.core.particles.ParticleTypes')

    let Entity = Java.loadClass('net.minecraft.world.entity.Entity')
    let PlayerButLoadClass = Java.loadClass('net.minecraft.world.entity.player.Player')

    // test: bullet swap
    /*
    let BloodNeedle = Java.loadClass('io.redspace.ironsspellbooks.entity.spells.blood_needle.BloodNeedle')
    let adapterGenNeedle = {
        // Entity.tick
        m_8119_() {
            let needle = BloodNeedle(this.level, this.shooter)
            needle.setNoGravity(true)
            needle.moveTo(this.position())
            needle.shoot(this.deltaMovement)
            needle.setDamage(this.damage)
            needle.setScale(0.4)
            this.level.addFreshEntity(needle)
            this.discard()
        },
    }*/

    /**@type {Internal.ProjectileEntity}*/
    let adapterBFG = {
        // helpers
        everyTargetsWithin(radius) {
            let res = []
            let myPos = this.position()
            for (let sub of this.level.getEntitiesWithin(this.boundingBox.inflate(radius))) {
                if (!sub.living || !sub.alive) continue
                // instanceof not working here, why?
                if (
                    // monster
                    sub.monster ||
                    // shift down: attack all
                    (this.altMode && sub !== this.owner && sub.owner !== this.owner)
                ) {
                } else continue // without friendly
                if (myPos.distanceTo(sub.position()) > radius) continue
                res.push(sub)
            }
            return res
        },

        // alters
        getDamage() {
            let base = this.super$getDamage()
            if (this.exploded) return base * 3
            return base * 0.05
        },

        // logic
        onProjectileTick() {
            this.super$onProjectileTick()
            if (this.age >= this.projectile.life - 5) return

            let myPos = this.position()

            // TODO sound
            // let soundSeed = Math.floor(Math.random() * 2147483648)
            // this.level.playSeededSound(null, this.x, this.y, this.z, 'scguns:item.beam.fire', 'master', 0.1, 0, soundSeed)

            // lightning
            for (let sub of this.everyTargetsWithin(10)) {
                let targetPos = Vec3d(sub.x, sub.y + sub.boundingBox.ysize / 2, sub.z)
                sub.invulnerableTime = 0
                this.super$onHitEntity(sub, targetPos, myPos, targetPos, false)
                this.spawnLightningArc(myPos, targetPos, 0.3, false)
                // this.level.playSeededSound(null, sub.x, sub.y, sub.z, 'scguns:item.flamethrower.fire_2', 'master', 0.1, 0, soundSeed)
            }
        },
        spawnLightningArc(/**@type {Vec3d}*/ start, /**@type {Vec3d}*/ end, minStep, allGreen) {
            this.level.sendParticles(
                allGreen || Math.random() < 0.05 ? ModParticleTypes.GREEN_FLAME.get() : ParticleTypes.ELECTRIC_SPARK,
                start.x(),
                start.y(),
                start.z(),
                0.01,
                0,
                0,
                0,
                0,
            )
            let direction = end.subtract(start)
            let distance = direction.length()
            if (distance < minStep) return
            let randSize = distance * 0.2
            let mid = start
                .add(direction.scale(0.5))
                .add((Math.random() - 0.5) * randSize, (Math.random() - 0.5) * randSize, (Math.random() - 0.5) * randSize)
            this.spawnLightningArc(start, mid, minStep, allGreen)
            this.spawnLightningArc(mid, end, minStep, allGreen)
        },
        onExpired() {
            this.exploded = true
            let myPos = this.position()
            for (let sub of this.everyTargetsWithin(15)) {
                let targetPos = new Vec3d(sub.x, sub.y + sub.boundingBox.ysize / 2, sub.z)
                sub.invulnerableTime = 0
                this.super$onHitEntity(sub, targetPos, myPos, targetPos, false)
                this.spawnLightningArc(myPos, targetPos, 1, true)
                this.level.sendParticles(
                    ModParticleTypes.PLASMA_EXPLOSION.get(),
                    targetPos.x(),
                    targetPos.y(),
                    targetPos.z(),
                    1,
                    0,
                    0,
                    0,
                    0.1,
                )
            }
            this.level.playSeededSound(null, this.x, this.y, this.z, 'scguns:item.plasma.fire', 'neutral', 5, 0, 0)

            for (let i = 0; i < 50; i++) {
                let offsetX = (Math.random() - 0.5) * 12
                let offsetY = (Math.random() - 0.5) * 12
                let offsetZ = (Math.random() - 0.5) * 12
                if (offsetX * offsetX + offsetY * offsetY + offsetZ * offsetZ > 144) {
                    i--
                    continue
                }
                offsetX += this.x
                offsetY += this.y
                offsetZ += this.z
                this.level.sendParticles(ModParticleTypes.PLASMA_EXPLOSION.get(), offsetX, offsetY, offsetZ, 1, 0, 0, 0, 0)
                for (let j = 0; j < 3; j++)
                    this.level.sendParticles(ModParticleTypes.GREEN_FLAME.get(), offsetX, offsetY, offsetZ, 1, 0, 0, 0, 0.2)
            }
        },
        onHitEntity(entity, hitPos, start, end, crit) {
            this.onExpired()
        },
        onHitBlock(state, pos, face, x, y, z) {
            this.onExpired()
        },
    }

    global.replaceGunAmmos = noRecursion => {
        // auto reload
        if (!noRecursion && Utils.server) {
            Utils.server.tell('auto reload')
            Utils.server.runCommand('kjs reload startup_scripts')
            Utils.server.scheduleInTicks(1, () => global.replaceGunAmmos(true))
        }

        ProjectileManager.getInstance().registerFactory(ModItems.SHOTGUN_SHELL.get(), (worldIn, entity, weapon, item, modifiedGun) => {
            if (entity.crouching) return LightningProjectileEntity(ModEntities.PROJECTILE.get(), worldIn, entity, weapon, item, modifiedGun)
            switch (Math.floor(Math.random() * 3)) {
                default:
                    return PlasmaProjectileEntity(ModEntities.PLASMA_PROJECTILE.get(), worldIn, entity, weapon, item, modifiedGun)
                case 1:
                    return SculkCellEntity(ModEntities.SCULK_CELL.get(), worldIn, entity, weapon, item, modifiedGun)
                case 2:
                    return ProjectileEntity(ModEntities.PROJECTILE.get(), worldIn, entity, weapon, item, modifiedGun)
            }
        })
        ProjectileManager.getInstance().registerFactory(Items.SLIME_BLOCK, (worldIn, entity, weapon, item, modifiedGun) => {
            let bullet = new JavaAdapter(
                ProjectileEntity,
                { altMode: entity.shiftKeyDown, __proto__: adapterBFG },
                ModEntities.PLASMA_PROJECTILE.get(),
                worldIn,
                entity,
                weapon,
                item,
                modifiedGun,
            )
            return bullet
        })
    }
    StartupEvents.postInit(() => global.replaceGunAmmos())
}
