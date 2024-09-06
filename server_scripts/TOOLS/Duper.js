ItemEvents.firstRightClicked('yc:duper', e => {
    let { player } = e
    for (let i of [player.getMainHandItem(), player.getOffHandItem()]) {
        if (i.id == 'yc:duper') continue
        i.count += 0.0001
        player.give(Item.of(i.toJson()))
    }
})
