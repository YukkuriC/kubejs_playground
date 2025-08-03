ForgeEvents.onEvent('net.minecraftforge.event.entity.player.PlayerInteractEvent$RightClickBlock', e => global.OnUseTools(e))
if (!global.OnUseTools) global.OnUseTools = () => {}
