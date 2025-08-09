// requires: magichem
ServerEvents.recipes(e => {
    e.shapeless('magichem:power_spike', ['magichem:power_spike', 'mna:rune_marking'])
        .keepIngredient('mna:rune_marking')
        .modifyResult((grid, ret) => {
            let targetPos = null
            let total = grid.width * grid.height
            for (let i = 0; i < total; i++) {
                let item = grid.get(i)
                if (item == 'mna:rune_marking') {
                    let raw = item.nbt?.mark
                    if (raw) {
                        targetPos = new BlockPos(raw.x, raw.y, raw.z)
                    }
                    break
                }
            }
            if (targetPos) {
                ret.orCreateTag.putLong('magichem.powerspike.targetpos', targetPos.asLong())
            } else {
                delete ret.orCreateTag['magichem.powerspike.targetpos']
            }
            return ret
        })
})
