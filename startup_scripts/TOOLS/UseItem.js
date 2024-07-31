const TARGETS = new Set(['yc:hoe', 'yc:pickaxe', 'yc:axe', 'yc:shovel'])

ForgeEvents.onEvent('net.minecraftforge.event.entity.player.PlayerInteractEvent$RightClickBlock', e => {
    const { level, itemStack } = e
    if (level.clientSide || !TARGETS.has(String(itemStack.id))) return
    const block = level.getBlock(e.pos)
    const { x, y, z } = e.pos
    /** @type Internal.Player */
    const player = e.getEntity()
    switch (itemStack.id) {
        case 'yc:hoe':
            if (!block) return
            const data = block.entityData
            level.tell(`id: ${block}; data: ${data}`)
            if (!data) return
            const manaMax = data.manaCap
            if (manaMax) level.runCommandSilent(`data merge block ${x} ${y} ${z} {mana: ${manaMax}}`)
            return

        case 'yc:pickaxe':
            if (!block?.popItem) return
            for (let i = x - 2; i <= x + 2; i++)
                for (let j = -64; j <= 256; j++)
                    for (let k = z - 2; k <= z + 2; k++) {
                        let bb = level.getBlock(i, j, k)
                        let shouldKeep = bb && (bb.hasTag('forge:ores') || bb.inventory || Math.random() < 0.05)
                        if (!shouldKeep) continue
                        for (const d of bb.getDrops() ?? []) block.popItem(d)
                        if (bb.inventory) for (const i of bb.inventory.allItems) block.popItem(i)
                        EVENT_BUS.post(new $BreakEvent(level, bb.pos, bb.blockState, player))
                    }
            return

        case 'yc:axe':
            if (!block) return
            let blockTargets = []
            let hasLeaves = false
            FloodFillBlocks(
                level,
                block.pos,
                bb => {
                    if (!bb) return false
                    if (!(bb.hasTag('minecraft:logs') || bb.hasTag('minecraft:leaves'))) return false
                    if (bb.hasTag('minecraft:leaves')) hasLeaves = true
                    return true
                },
                bb => blockTargets.push(bb),
            )
            if (blockTargets.length > 1 && hasLeaves) for (const bb of blockTargets) BreakBlock(level, bb, player)
            return

        case 'yc:shovel':
            for (let i = x - 1; i <= x + 1; i++)
                for (let j = y - 1; j <= y + 1; j++)
                    for (let k = z - 1; k <= z + 1; k++) {
                        let bb = level.getBlock(i, j, k)
                        BreakBlock(level, bb, player)
                    }
            return
    }
})
