// requires: create
// requires: mna

ServerEvents.recipes(e => {
    let SCROLL_DATA_TYPES = ['component', 'shape', 'modifier_0', 'modifier_1', 'modifier_2']
    let MaterialChecklist = Java.loadClass('com.simibubi.create.content.schematics.cannon.MaterialChecklist')
    let ItemRequirement = Java.loadClass('com.simibubi.create.content.schematics.requirement.ItemRequirement')
    let cRequirement = ItemRequirement.__javaObject__.getConstructor(
        ItemRequirement.ItemUseType,
        Java.loadClass('net.minecraft.world.item.ItemStack'),
    )

    e.shapeless('create:clipboard', ['mna:enchanted_vellum', 'create:clipboard'])
        .keepIngredient('mna:enchanted_vellum')
        .modifyResult((grid, item) => {
            let { width, height } = grid
            let scroll,
                clipboard,
                total = width * height
            for (let i = 0; i < total; i++) {
                let item = grid.get(i)
                if (item == 'create:clipboard') clipboard = item
                else if (item == 'mna:enchanted_vellum') scroll = item
                if (scroll && clipboard) break
            }

            // collect items
            let scrollData = scroll.nbt.ritual_reagent_data
            let itemDict = {}
            for (let type of SCROLL_DATA_TYPES) {
                let cnt = scrollData[`${type}_items_count`]
                for (let i = 0; i < cnt; i++) {
                    let item = scrollData[`${type}_items_${i}`]
                    itemDict[item] = (itemDict[item] || 0) + 1
                }
            }
            let patternDict = {}
            let cnt_pattern = scrollData[`pattern_count`]
            for (let i = 0; i < cnt_pattern; i++) {
                let pat = scrollData[`pattern_${i}`]
                patternDict[pat] = (patternDict[pat] || 0) + 1
            }

            // build clipoboard
            let list = new MaterialChecklist()
            for (let [item, cnt] of Object.entries(itemDict)) {
                list.require(cRequirement.newInstance(ItemRequirement.ItemUseType.CONSUME, Item.of(item, cnt)))
            }
            // BUG: clipboard don't support NBT
            for (let [pat, cnt] of Object.entries(patternDict)) {
                let bottle = Item.of('mna:manaweave_bottle', cnt, { pattern: pat })
                list.require(cRequirement.newInstance(ItemRequirement.ItemUseType.CONSUME, bottle))
            }

            return list.createWrittenClipboard()
        })
})
