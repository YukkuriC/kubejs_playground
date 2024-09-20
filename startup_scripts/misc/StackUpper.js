ItemEvents.modification(e => {
    for (let id of Ingredient.of('*').itemIds) {
        e.modify(id, item => {
            if (item.maxStackSize > 1 && item.maxStackSize < 64) item.maxStackSize = 64
        })
    }
})
