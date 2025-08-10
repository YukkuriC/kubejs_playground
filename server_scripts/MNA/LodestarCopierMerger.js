ServerEvents.recipes(e => {
    let TagParser = Java.loadClass('net.minecraft.nbt.TagParser')
    let UUIDCls = Java.loadClass('java.util.UUID')

    e.shapeless('mna:lodestar_copier', ['mna:lodestar_copier']).modifyResult((grid, item) => {
        let { player, width, height } = grid
        let toCopy = player.offHandItem.nbt?.stored_lodestar
        if (!toCopy) return

        let src_item,
            total = width * height
        for (let i = 0; i < total; i++) {
            src_item = grid.get(i)
            if (src_item.id == 'mna:lodestar_copier') break
        }
        let mergeTarget = src_item.orCreateTag.stored_lodestar
        if (!mergeTarget) {
            mergeTarget = {
                commands: [],
                groups: [],
            }
        }

        // count X border
        let maxX = -1e10
        let startX = 1e10
        for (let node of toCopy.commands) {
            maxX = Math.max(maxX, node.x)
        }
        for (let grp of toCopy.groups) {
            maxX = Math.max(maxX, grp.x + grp.w)
        }
        for (let node of mergeTarget.commands) {
            startX = Math.min(startX, node.x)
        }
        for (let grp of mergeTarget.groups) {
            startX = Math.min(startX, grp.x)
        }
        let delta = maxX + 10 - startX

        // swap all uuid & add x from me
        let uuidSwap = {}
        let pickSwapUUID = uuid => {
            if (!(uuid in uuidSwap)) {
                uuidSwap[uuid] = String(UUIDCls.randomUUID())
            }
            return uuidSwap[uuid]
        }
        for (let node of mergeTarget.commands) {
            node.x += delta
            node.id = pickSwapUUID(node.id)
            node.start = false
            for (let conn of node.connections) conn.target = pickSwapUUID(conn.target)
        }
        for (let grp of mergeTarget.groups) {
            grp.x += delta
        }

        // merge from target
        for (let node of toCopy.commands) mergeTarget.commands.push(node)
        for (let grp of toCopy.groups) mergeTarget.groups.push(grp)
        item.orCreateTag.stored_lodestar = mergeTarget
        player.tell(mergeTarget.commands.length)

        return item
    })
})
