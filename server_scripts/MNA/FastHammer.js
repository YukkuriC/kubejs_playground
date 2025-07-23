// requires: mna
BlockEvents.rightClicked('mna:runic_anvil', e => {
    let {
        player,
        hand,
        item: activeStack,
        item: { item },
        block: {
            blockState,
            blockState: { block },
            entity,
            pos,
        },
    } = e
    if (activeStack.id != 'mna:runesmith_hammer') return
    player.cooldowns.removeCooldown(item)

    // 11111, 5!
    let hitsLeft = 5
    let doHit = () => {
        global.test = block
        block.use(blockState, player.level, pos, player, hand, null)
        player.cooldowns.removeCooldown(item)
        if (hitsLeft > 0) player.server.scheduleInTicks(1, doHit)
        hitsLeft--
    }
    player.server.scheduleInTicks(1, doHit)
})
