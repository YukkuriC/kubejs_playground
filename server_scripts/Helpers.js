// chain block breaking
const MAX_CHAIN = 4096
const DELTA_DIRS = []
for (let d of [-1, 1]) {
    DELTA_DIRS.push([d, 0, 0], [0, d, 0], [0, 0, d])
}

/**
 * general helper
 * @param { Internal.Level } level
 * @param { BlockPos } blockPos
 * @param { (block:Internal.BlockContainerJS) => boolean } predicate
 * @param { (block:Internal.BlockContainerJS) => void } callback
 */
function FloodFillBlocks(level, blockPos, predicate, callback) {
    let blockQueue = [blockPos]
    let visited = new Set()
    visited.add(blockPos.hashCode())
    for (let _ = 0; _ < MAX_CHAIN && blockQueue.length > 0; ) {
        let pos = blockQueue.shift()
        let { x, y, z } = pos
        let bb = level.getBlock(pos)
        if (!predicate(bb)) continue
        callback(bb)
        _++

        // dfs
        for (let delta of DELTA_DIRS) {
            let [i, j, k] = delta
            let newPos = new BlockPos(x + i, y + j, z + k)
            let newKey = newPos.hashCode()
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
 * @param { Player } player
 * @param { boolean } drop
 */
function BreakBlock(level, block, player, noDrop) {
    if (!block) return
    if (!noDrop) {
        for (let item of block.getDrops()) player.give(item)
    }
    global.EVENT_BUS.post(new $BreakEvent(level, block.pos, block.blockState, player))
    level.destroyBlock(block.pos, false, player)
}
/**
 * check crop age
 * @param { Internal.CropBlock } block
 * @param { Internal.BlockState } state
 */
function CanHarvest(block, state) {
    if (block.isMaxAge && block.isMaxAge(state)) return true
    for (const prop of state.getProperties()) {
        if (!prop instanceof $IntegerProperty) continue
        if (prop.getName() != 'age') continue
        /** @type { Internal.IntegerProperty }*/
        let intProp = prop
        let age = state.getValue(intProp)
        let maxAge = intProp.getPossibleValues().size() - 1
        if (age == maxAge) return true
    }
    return false
}

global.dump = obj => {
    let lines = ['{']
    for (let pair of Object.entries(obj)) {
        lines.push(`    ${pair[0]}: ${pair[1]},`)
    }
    lines.push('}')
    return lines.join('\n')
}

global.dumpDeep = (obj, deltaIndent) => {
    let noNewLine = deltaIndent < 0
    if (!noNewLine) deltaIndent = deltaIndent || 2
    let used = new Set()
    let inner = (obj, indent) => {
        try {
            if (used.has(obj)) return '{...}'
            used.add(obj)
            let lines = ['{']
            for (let pair of Object.entries(obj)) {
                let [k, v] = pair
                let vStr = v && typeof v === 'object' ? inner(v, indent + deltaIndent) : String(v)
                lines.push(' '.repeat(indent + deltaIndent) + `${k}:${vStr},`)
            }
            lines.push(' '.repeat(indent) + '}')
            used.delete(obj)
            return lines.join(noNewLine ? '' : '\n')
        } catch (e) {
            return ' '.repeat(indent) + `[Error: ${e}]`
        }
    }
    return inner(obj, noNewLine ? NaN : 0)
}
