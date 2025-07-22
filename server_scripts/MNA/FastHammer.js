// requires: mna
BlockEvents.rightClicked('mna:runic_anvil', e => {
    let {
        player,
        item: { item },
    } = e
    player.cooldowns.removeCooldown(item)
})
