global.curiosEvents = {
    'yc:charm': {
        onEquip(item, player) {
            Client.player.tell(`equip, ${item}, ${player}`)
        },
        onUnequip(item, player) {
            Client.player.tell(`unequip, ${item}, ${player}`)
        },
    },
}

try {
    ForgeEvents.onEvent('top.theillusivec4.curios.api.event.CurioChangeEvent', e => {
        let player = e.getEntity()
        if (!player.isPlayer()) return
        let itemFrom = e.getFrom()
        let itemTo = e.getTo()
        try {
            let funcs
            ;(funcs = global.curiosEvents[itemFrom.id]) && funcs.onUnequip(itemFrom, player)
            ;(funcs = global.curiosEvents[itemTo.id]) && funcs.onEquip(itemTo, player)
        } catch (e) {
            console.error(e)
        }
    })

    StartupEvents.registry('item', e => {
        e.create('yc:charm', 'basic').maxStackSize(1).texture(`yc:item/charm`).glow(true).rarity('epic').tag('curios:charm')
    })
} catch (e) {
    console.error(e)
}
