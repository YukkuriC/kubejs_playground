// requires: goety
{
    EntityEvents.death(e => {
        let { entity, level } = e
        if (!entity.living) return
        let effect = entity.potionEffects.getActive(`goety:gold_touched`)
        if (!effect) return
        let lvl = effect.amplifier + 1
        for (let i = 0; i < (Math.floor(Math.random(3)) + 1) * lvl; ++i) {
            let drop = level.createEntity('item')
            drop.setPosition(entity.x, entity.y, entity.z)
            drop.deltaMovement = new Vec3d(Math.random() * 0.2 - 0.1, 0.2, Math.random() * 0.2 - 0.1)
            drop.item = Item.of('iron_nugget')
            drop.spawn()
        }
    })
}
