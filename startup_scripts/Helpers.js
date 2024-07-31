// chain block breaking
const MAX_CHAIN = 4096
const EVENT_BUS = ForgeEvents.eventBus()
const $BreakEvent = Java.loadClass('net.minecraftforge.event.level.BlockEvent$BreakEvent')

/**
 * general helper
 * @param { Internal.Level } level
 * @param { {x:number; y:number; z:number} } blockPos
 * @param { (block:Internal.BlockContainerJS) => boolean } predicate
 * @param { (block:Internal.BlockContainerJS) => void } callback
 */
function FloodFillBlocks(level, blockPos, predicate, callback) {
    const blockQueue = [blockPos]
    const visited = new Set()
    visited.add(`${blockPos.x},${blockPos.y},${blockPos.z}`)
    for (let _ = 0; _ < MAX_CHAIN && blockQueue.length > 0; ) {
        let { x, y, z } = blockQueue.pop()
        let bb = level.getBlock(x, y, z)
        if (!predicate(bb)) continue
        callback(bb)
        _++

        // dfs
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++)
                for (let k = -1; k <= 1; k++) {
                    if (!i && !j && !k) continue
                    let newPos = { x: x + i, y: y + j, z: z + k }
                    let newKey = `${newPos.x},${newPos.y},${newPos.z}`
                    if (!visited.has(newKey)) {
                        visited.add(newKey)
                        blockQueue.push(newPos)
                    }
                }
    }
}
/**
 * helper general break block
 * @param { Internal.Level } level
 * @param { Internal.BlockContainerJS } block
 * @param { Internal.Player } player
 */
function BreakBlock(level, block, player) {
    if (!block) return
    level.destroyBlock(block.pos, true, player)
    EVENT_BUS.post(new $BreakEvent(level, block.pos, block.blockState, player))
}

global.FloodFillBlocks = FloodFillBlocks
global.BreakBlock = BreakBlock
