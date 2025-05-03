// requires: scguns

{
    let ProjectileManager = Java.loadClass('top.ribs.scguns.common.ProjectileManager')
    let ModEntities = Java.loadClass('top.ribs.scguns.init.ModEntities')
    let ModItems = Java.loadClass('top.ribs.scguns.init.ModItems')

    let PlasmaProjectileEntity = Java.loadClass('top.ribs.scguns.entity.projectile.PlasmaProjectileEntity')
    let SculkCellEntity = Java.loadClass('top.ribs.scguns.entity.projectile.SculkCellEntity')
    let LightningProjectileEntity = Java.loadClass('top.ribs.scguns.entity.projectile.LightningProjectileEntity')
    let ProjectileEntity = Java.loadClass('top.ribs.scguns.entity.projectile.ProjectileEntity')

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

    global.replaceGunAmmos = () => {
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
    }
    StartupEvents.postInit(global.replaceGunAmmos)
}
