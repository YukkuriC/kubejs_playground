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

    // dupe by recipe
    let all_except_duper = Ingredient.all.subtract(Ingredient.of('yc:duper'))
    let all_except_duper_all = Ingredient.all.subtract(Ingredient.of('#yc:duper'))
    e.shapeless('yc:duper', [all_except_duper, 'yc:duper']).keepIngredient(all_except_duper)
    e.shapeless('yc:duper_2', [all_except_duper_all, 'yc:duper_2']).modifyResult((grid, item) => {
        let total = grid.width * grid.height
        for (let i = 0; i < total; i++) {
            let item = grid.get(i)
            if (item.empty || item.hasTag('yc:duper')) continue
            return item.withCount(2)
        }
    })
    e.shapeless('yc:duper_2', ['yc:duper'])
})

ItemEvents.crafted('yc:duper', e => {
    let inv = e.inventory
    let cnt = inv.slots
    let duperMult = 0
    if (inv.find('yc:duper') >= 0) duperMult = 2
    for (let i = 0; i < cnt; i++) {
        let item = inv.getStackInSlot(i)
        if (item.isEmpty() || item.id == 'yc:duper') continue
        item.count *= duperMult
    }
    inv.setChanged()
})
