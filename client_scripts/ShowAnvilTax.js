NativeEvents.onEvent('net.neoforged.neoforge.event.entity.player.ItemTooltipEvent', e => {
    let tax = e.itemStack.get('repair_cost')
    if (tax) e.toolTip.add(Text.red(`Repair Cost: ${tax}`))
})
