// requires: unsafejs
{
    let Integer = Java.loadClass('java.lang.Integer')
    let Int0 = Integer('0')
    let Creeper = Java.loadClass('net.minecraft.world.entity.monster.Creeper')
    let fSwell = Reflection.getField(Creeper, 'swell')
    NativeEvents.onEvent('net.neoforged.neoforge.event.tick.EntityTickEvent$Post', ev => {
        let { entity } = ev
        if (!(entity instanceof Creeper)) return
        let swell = fSwell.get(entity)
        if (swell >= 29) fSwell.set(entity, Int0)
    })
}
