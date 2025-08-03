// requires: scguns

ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingHurtEvent', e => {
    let { entity, source, amount } = e
    if (source.type().msgId() != 'scguns.bullet') return
    let { player } = source
    if (entity === player) return e.setCanceled(true)
    if (player.saturation < 20) player.saturation++
})
