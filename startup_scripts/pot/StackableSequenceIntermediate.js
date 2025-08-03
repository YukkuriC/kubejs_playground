ItemEvents.modification(e => {
    Ingredient.all.itemIds
        .filter(x => x.includes('incomplete'))
        .forEach(id =>
            e.modify(id, item => {
                item.maxStackSize = 64
            }),
        )
})
