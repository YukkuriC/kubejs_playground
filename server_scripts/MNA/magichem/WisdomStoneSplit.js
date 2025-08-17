// requires: magichem
ServerEvents.recipes(e => {
    for (let id of [
        'magichem:inert_wisdom_stone',
        'magichem:wisdom_stone_nigredo',
        'magichem:wisdom_stone_albedo',
        'magichem:wisdom_stone_citrinitas',
        'magichem:wisdom_stone_rubedo',
        'magichem:philosophers_stone',
    ]) {
        let raw = Item.of(id).strongNBT()
        let splitted = Item.of(id, { CustomModelData: 1 }).strongNBT()
        e.shapeless(splitted, [raw])
        e.shapeless(raw, [splitted])
    }
})
