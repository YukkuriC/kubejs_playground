/** @type string[] */
const YC_StickModes = ['None', 'SortChest', 'MergeTumor', 'ChainBreak']

function GetYCStickState(/**@type Internal.Item */ item) {
    let tag = item.getOrCreateTag()
    return tag.mode ?? YC_StickModes[0]
}

ItemEvents.firstLeftClicked('yc:stick', e => {
    const { item } = e
    let mode = GetYCStickState(item)
    let idx = YC_StickModes.indexOf(mode)
    idx = (idx + 1) % YC_StickModes.length
    let newMode = YC_StickModes[idx]
    let tag = item.getOrCreateTag()
    tag.mode = newMode
    tag.display = { Name: `{"text":"YC's Stick (${newMode})"}` }
})
ItemEvents.firstRightClicked('yc:stick', e => {
    const { level, item, player } = e
    let mode = GetYCStickState(item)
    let { block } = e.getTarget()
    switch (mode) {
        case 'SortChest':
            if (block?.inventory) {
                /**@type {Internal.BlockContainerJS[]}*/
                let chests = []
                FloodFillBlocks(
                    level,
                    block.pos,
                    b => b.inventory,
                    b => chests.push(b),
                )

                /**@type {Record<string,Internal.ItemStack[]>}*/
                let itemSlotMap = {}
                for (const bb of chests) {
                    for (const ii of bb.inventory.getAllItems()) {
                        let key = ii.id + ii.nbtString
                        if (!itemSlotMap[key]) itemSlotMap[key] = []
                        itemSlotMap[key].push(ii)
                    }
                }
                for (let lst of Object.values(itemSlotMap)) {
                    lst.sort((a, b) => {
                        let keyA = a.count
                        let keyB = b.count
                        return keyB - keyA
                    })
                    let head = lst[0]
                    let cumCount = 0
                    for (let i = 1; i < lst.length; i++) {
                        let sub = lst[i]
                        cumCount += sub.count
                        sub.count = 0
                    }
                    head.count += cumCount
                }
            }
            break

        case 'MergeTumor':
            let tumors = []
            let tumorDataMax = {}
            for (let ii of block.inventory.getAllItems()) {
                if (ii.id != 'kubejs:random_tumor') continue
                tumors.push(ii)
            }
            for (let ii of tumors) {
                let tag = ii.getOrCreateTag().organData
                for (let pair of Object.entries(tag)) {
                    let [k, v] = pair
                    if (!tumorDataMax[k]) tumorDataMax[k] = 0
                    tumorDataMax[k] = Math.max(tumorDataMax[k], v)
                }
            }
            for (let ii of tumors) {
                let tag = ii.getOrCreateTag()
                let data = tag.organData
                if (Object.keys(data).length < 5) {
                    ii.count = 0
                    continue
                }
                let sortedKey = Object.keys(data).sort()
                data = tag.organData = {}
                for (let k of sortedKey) data[k] = tumorDataMax[k]
            }
            break

        case 'ChainBreak':
            if (block) {
                let targets = []
                let cnt = 0
                FloodFillBlocks(
                    level,
                    block.pos,
                    b => cnt < 500 && b.id == block.id,
                    b => {
                        targets.push(b)
                        cnt++
                    },
                )
                if (targets.length > 400) return player.tell('R U SURE?')
                for (let b of targets) {
                    BreakBlock(level, b, player)
                }
            }

            break
    }
})

global.GetYCStickState = GetYCStickState
