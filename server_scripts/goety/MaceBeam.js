{
    let CorruptedBeam = Java.loadClass('com.Polarice3.Goety.common.entities.projectiles.CorruptedBeam')
    let ModEntityType = Java.loadClass('com.Polarice3.Goety.common.entities.ModEntityType')

    let clearBeams = (/**@type {Player}*/ player) => {
        for (let e of player.level.getEntitiesWithin(player.boundingBox.inflate(3))) {
            if (e.type != 'goety:corrupted_beam' || e.owner !== player) continue
            e.discard()
            return true
        }
    }

    ItemEvents.rightClicked('goety:philosophers_mace', e => {
        let { player: caster } = e
        caster.swing(e.hand, true)
        if (clearBeams(caster)) return
        let beam = new CorruptedBeam(ModEntityType.CORRUPTED_BEAM.get(), caster.level, caster)
        let lookVec = caster.getViewVector(1)
        beam.setPos(
            //
            caster.x + lookVec.x() / 2,
            caster.eyeY - 0.2,
            caster.z + lookVec.z() / 2,
        )
        beam.yRotO = caster.yHeadRot
        beam.xRotO = caster.xRotO
        beam.setOwner(caster)
        // beam.setItemBase(true)
        beam.spawn()
    })
}
