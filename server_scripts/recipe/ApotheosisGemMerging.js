ServerEvents.recipes(e => {
    let rarity = ['common', 'uncommon', 'rare', 'epic', 'mythic', 'ancient']
    let materials = rarity.map(x => `apotheosis:${x}_material`)

    for (let i = 1; i < rarity.length; i++) {
        let old_rarity = `apotheosis:${rarity[i - 1]}`
        let old_gem = Item.of('apotheosis:gem', 1, { affix_data: { rarity: `apotheosis:${rarity[i - 1]}` } }).weakNBT()
        let new_gem = {
            item: 'apotheosis:gem',
            nbt: { affix_data: { rarity: `apotheosis:${rarity[i]}` } },
        }

        e.shaped(new_gem, [' X ', 'GGG', ' Y '], {
            G: old_gem,
            X: 'apotheosis:gem_dust',
            Y: materials[i],
        })
            .modifyResult((/**@type {Internal.ModifyRecipeCraftingGrid}*/ grid, /**@type {Internal.ItemStack}*/ item) => {
                let total = grid.width * grid.height
                let old_type = null
                for (let i = 0; i < total; i++) {
                    let gem = grid.get(i)
                    if (gem.id != 'apotheosis:gem') continue
                    if (gem.nbt?.affix_data?.rarity != old_rarity || (old_type && old_type != gem.nbt.gem))
                        return Item.of('apotheosis:gem_dust', Math.floor(3 + Math.random() * 6))
                    old_type = gem.nbt.gem
                }
                item.orCreateTag.merge({ gem: old_type })
                item.orCreateTag.merge(new_gem.nbt)
                return item
            })
            .id(`kubejs:shapeless_gem_${rarity[i]}`)
    }
})
