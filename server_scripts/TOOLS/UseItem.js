const TARGETS = new Set(['yc:hoe', 'yc:pickaxe', 'yc:axe', 'yc:shovel'])

/**
 * @param { Internal.PlayerInteractEvent$RightClickBlock } e
 * @returns
 */
function OnUseTools(e) {
    const { level, itemStack } = e
    if (level.clientSide || !TARGETS.has(String(itemStack.id))) return
    const block = level.getBlock(e.pos)
    const { x, y, z } = e.pos
    /** @type Internal.Player */
    const player = e.getEntity()
    switch (itemStack.id) {
        case 'yc:hoe':
            if (player.isShiftKeyDown()) {
                let msg = `block: ${block}`
                if (block?.entityData) msg += `\ndata: ${block?.entityData}`
                level.tell(msg)
            }
            for (let i = x - 2; i <= x + 2; i++)
                for (let j = y - 1; j <= y + 1; j++)
                    for (let k = z - 2; k <= z + 2; k++) {
                        let newPos = new BlockPos(i, j, k)
                        let bb = level.getBlock(newPos)
                        if (!bb) continue

                        let simpleIsTillable =
                            bb.id == 'minecraft:dirt' ||
                            bb.id == 'minecraft:dirt_path' ||
                            bb.id == 'minecraft:grass_block' ||
                            bb.id == 'minecraft:mycelium' ||
                            bb.id == 'minecraft:podzol'

                        // grow crops
                        /** @type Internal.BonemealableBlock */
                        let bbb = bb.blockState.block
                        if (bbb.isValidBonemealTarget && (!simpleIsTillable || !player.isShiftKeyDown())) {
                            if (bbb.isValidBonemealTarget(level, newPos, bb.blockState, false)) {
                                bbb.performBonemeal(level, level.random, newPos, bb.blockState)
                            }
                        }

                        // till dirt
                        if ((!bb.up || !level.getBlockState(bb.up.pos).solid) && simpleIsTillable) {
                            level.destroyBlock(newPos, false)
                            level.runCommandSilent(`setblock ${newPos.x} ${newPos.y} ${newPos.z} minecraft:farmland[moisture=7]`)
                        }

                        // nbt
                        let data = bb.entityData
                        if (data) {
                            let manaMax = data.manaCap
                            if (manaMax) level.runCommandSilent(`data merge block ${newPos.x} ${newPos.y} ${newPos.z} {mana: ${manaMax}}`)
                        }
                    }
            return

        case 'yc:pickaxe':
            if (!block?.popItem) return
            for (let i = x - 2; i <= x + 2; i++)
                for (let j = -64; j <= 256; j++)
                    for (let k = z - 2; k <= z + 2; k++) {
                        let bb = level.getBlock(i, j, k)
                        let shouldKeep = bb && (bb.hasTag('forge:ores') /* || bb.inventory */ || Math.random() < 0.05)
                        if (!shouldKeep) continue
                        for (const d of bb.getDrops() ?? []) block.popItem(d)
                        // if (bb.inventory) for (const i of bb.inventory.allItems) block.popItem(i)
                        global.EVENT_BUS.post(new $BreakEvent(level, bb.pos, bb.blockState, player))
                    }
            return

        case 'yc:axe':
            if (!block) return
            /** @type Internal.BlockContainerJS[] */
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
            blockTargets = []
            for (let i = x - 1; i <= x + 1; i++)
                for (let j = y - 1; j <= y + 1; j++)
                    for (let k = z - 1; k <= z + 1; k++) {
                        let bb = level.getBlock(i, j, k)
                        if (bb.entityData || bb.inventory) {
                            level.tell(`danger at ${bb.pos}`)
                            return
                        }
                        blockTargets.push(bb)
                    }
            for (const bb of blockTargets) BreakBlock(level, bb, player)

            return
    }
}

global.OnUseTools = OnUseTools
