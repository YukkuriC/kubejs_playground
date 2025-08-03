// requires: mna
{
    let ServerMessageDispatcher = Java.loadClass('com.mna.network.ServerMessageDispatcher')
    let ParticleInit = Java.loadClass('com.mna.api.particles.ParticleInit')
    let Construct = Java.loadClass('com.mna.entities.constructs.animated.Construct')
    let ConstructCapability = Java.loadClass('com.mna.api.entities.construct.ConstructCapability')

    let CHECK_RADIUS = 16

    StartupEvents.registry('block', e => {
        e.create('yc:mna/alt_mana_crystal')
            .blockEntity(be => {
                be.serverTick(80, 0, x => global.rechargeConstructs(x))
            })
            .resistance(114514)
            .displayName('Alt Mana Crystal')
            .defaultTranslucent()
            .box(2, 0, 2, 14, 16, 14, true)
    })

    /**@type {(blockEntityJS0: Internal.BlockEntityJS): void}*/
    global.rechargeConstructs = be => {
        let myPos = be.blockPos.center
        for (let construct of be.level.getEntitiesOfClass(Construct, AABB.ofBlock(be.blockPos).inflate(CHECK_RADIUS))) {
            if (construct.manaPct < 1 && construct.getConstructData().isCapabilityEnabled(ConstructCapability.STORE_MANA)) {
                let distNorm = myPos.distanceTo(construct.position()) / CHECK_RADIUS
                let mana = 200 * (1 - distNorm)
                construct.adjustMana(mana)
                ServerMessageDispatcher.sendParticleSpawn(
                    // src
                    myPos.x(),
                    myPos.y() + 1,
                    myPos.z(),
                    // dst
                    construct.x,
                    construct.eyeY,
                    construct.z,
                    // color, range, dim, type
                    0,
                    32,
                    be.level.dimensionKey,
                    ParticleInit.LIGHTNING_BOLT.get(),
                )
            }
        }
    }
}
