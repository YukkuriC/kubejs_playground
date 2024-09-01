ItemEvents.rightClicked('ars_novaeau:blank_parchment', e => {
    if (e.level.isClientSide()) return
    let { player, item } = e
    let block = e.target.block
    let blockData = block.getEntityData()
    if (!blockData || !blockData['ars_nouveau:turret_caster']) return

    let newItem = Item.of('ars_nouveau:spell_parchment')
    newItem.getOrCreateTag()['ars_nouveau:caster'] = blockData['ars_nouveau:turret_caster']
    item.shrink(1)
    player.give(newItem)
})
