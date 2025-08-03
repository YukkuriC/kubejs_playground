ForgeEvents.onEvent('net.minecraftforge.client.event.ViewportEvent$RenderFog', e => {
    if (e.type == 'none') return
    e.farPlaneDistance *= 100
    e.nearPlaneDistance *= 100
    e.setCanceled(true)
})
