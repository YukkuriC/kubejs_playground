/** @type string[] */
const YC_StickModes = ['None', 'SortChest', 'MergeTumor', 'SpawnTumor', 'ChainBreak', 'Sample']

function GetYCStickState(/**@type Internal.Item */ item) {
    let tag = item.getOrCreateTag()
    return tag.mode ?? YC_StickModes[0]
}

const StickBreakCache = {}

ItemEvents.firstLeftClicked('yc:stick', e => {
    const { item, player } = e
    let mode = GetYCStickState(item)
    let idx = YC_StickModes.indexOf(mode)
    if (player.isShiftKeyDown()) idx = idx - 1 + YC_StickModes.length
    else idx = idx + 1
    idx %= YC_StickModes.length
    let newMode = YC_StickModes[idx]
    let tag = item.getOrCreateTag()
    tag.mode = newMode
    tag.display = { Name: `{"text":"YC's Stick (${newMode})"}` }
})
ItemEvents.firstRightClicked('yc:stick', e => {
    const { level, item, player } = e
    let mode = GetYCStickState(item)
    let { block } = e.getTarget()
    if (mode == 'SortChest') {
        if (block?.inventory) {
            /**@type {Internal.BlockContainerJS[]}*/
            let chests = []
            global.FloodFillBlocks(
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
    } else if (mode == 'MergeTumor') {
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
            data = {}
            for (let k of sortedKey) data[k] = tumorDataMax[k]
            tag.organData = data
        }
    } else if (mode == 'SpawnTumor') {
        let outputItems = []
        let fakeLootEvent = {
            player: player,
            addLoot: i => outputItems.push(i),
        }
        for (let i = 0; i < 10; i++) {
            chestLootOnlyStrategies['kubejs:d8'](fakeLootEvent)
        }
        for (let item of outputItems) player.give(item)
    } else if (mode == 'ChainBreak') {
        let cancelBy = function (reason) {
            delete StickBreakCache[player.stringUuid]
            Utils.server.tell(reason)
        }

        if (block) {
            if (StickBreakCache[player.stringUuid]) {
                let [selected, blocks] = StickBreakCache[player.stringUuid]
                if (!block.pos.equals(selected.pos)) {
                    return cancelBy('Cancelled for different block')
                }
                let breakCounter = {}
                for (let b of blocks) {
                    let drops = b.getDrops()
                    if (!drops || drops.length <= 0) drops = [b.item]
                    for (let d of drops) {
                        let key = String(d.id) + String(d.nbt)
                        if (breakCounter[key]) breakCounter[key].count += d.count
                        else breakCounter[key] = d
                    }
                    global.BreakBlock(level, b, player, true)
                }
                for (let k in breakCounter) {
                    player.give(breakCounter[k])
                }

                return cancelBy(`${blocks.length} blocks broken`)
            }

            let targets = []
            // let cnt = 0
            global.FloodFillBlocks(
                level,
                block.pos,
                b => /*cnt < 1001 &&*/ b.id == block.id,
                b => {
                    targets.push(b)
                    // cnt++
                },
            )
            // if (targets.length > 1000) return cancelBy('R U SURE?')
            StickBreakCache[player.stringUuid] = [block, targets]
            return Utils.server.tell(`Selected ${targets.length} blocks`)
        } else {
            return cancelBy('Cancelled for no block')
        }
    } else if (mode == 'Sample') {
        if (!block) return
        for (let i of block.getDrops()) {
            if (i.id === block.id) return player.give(i)
        }
        player.give(block.item)
    }
})
