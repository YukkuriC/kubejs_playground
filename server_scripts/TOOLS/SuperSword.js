const $EvokerFangs = Java.loadClass('net.minecraft.world.entity.projectile.EvokerFangs')
const $MobEffectInstance = Java.loadClass('net.minecraft.world.effect.MobEffectInstance')
ItemEvents.rightClicked('yc:sword', e => {
    const { level, player } = e
    const { x, y, z } = player
    const rot = (player.yRotO + 90) * (3.14159 / 180)
    for (let d = -2; d <= 2; d++) {
        let rot1 = rot + d * 0.4
        for (let i = 0; i < 15 - Math.abs(d * 5); i++) {
            let r = 1.25 * (i + 1)
            let obj = new $EvokerFangs(level, x + Math.cos(rot1) * r, y, z + Math.sin(rot1) * r, rot1, i + Math.abs(d * 2), player)
            level.addFreshEntity(obj)
        }
    }
})
