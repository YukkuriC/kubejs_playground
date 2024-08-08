/** @type string[] */
const YC_StickModes = ['None', 'SortChest']

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
    const { level, item } = e
    let mode = GetYCStickState(item)
    switch (mode) {
        case 'SortChest':
            let { block } = e.getTarget()
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
    }
})

global.GetYCStickState = GetYCStickState
