ItemEvents.firstRightClicked('yc:duper', e => {
    let { player } = e
    for (let i of [player.getMainHandItem(), player.getOffHandItem()]) {
        if (i.id == 'yc:duper') continue
        i.count += 0.0001
        player.give(Item.of(i.toJson()))
    }
})

ServerEvents.recipes(e => {
    function codeMatcher(grid, item) {
        let total = grid.width * grid.height
        let code = ''
        for (let i = 0; i < total; i++) {
            let item = grid.get(i)
            if (item.id != 'minecraft:air') code += item.count
        }
        if (code == '114514' || code == '1919' || code == '810') return item
    }
    for (let i = 2; i <= 6; i++) e.shapeless('yc:duper', Array(i).fill('#minecraft:logs')).modifyResult(codeMatcher)
})
