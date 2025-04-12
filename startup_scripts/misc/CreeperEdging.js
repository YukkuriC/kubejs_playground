{
    let Integer = Java.loadClass('java.lang.Integer')
    let Int0 = Integer('0')
    let Creeper = Java.loadClass('net.minecraft.world.entity.monster.Creeper')
    let fSwell = Creeper.__javaObject__.getDeclaredField('f_32270_')
    fSwell.setAccessible(true)
    ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingEvent$LivingTickEvent', ev => {
        let { entity } = ev
        if (!(entity instanceof Creeper)) return
        let swell = fSwell.get(entity)
        if (swell >= 29) fSwell.set(entity, Int0)
    })
}
