{
    let isBuildMode = player => player.persistentData.buildModeActive
    let setBuildMode = (player, flag) => (player.persistentData.buildModeActive = flag)

    let addUsage = (player, blockId, count) => {
        count = count || 1
        let pool = player.persistentData.buildModeCounts
        if (!pool) pool = player.persistentData.buildModeCounts = {}
        let newCount = (pool[blockId] || 0) + count
        if (newCount > 0) {
            pool[blockId] = newCount
        } else {
            delete pool[blockId]
        }
    }

    let doThrow = (ctx, text) => {
        ctx.source.player.tell(Text.red(text))
        throw text
    }
    let assertPlayer = player => {
        if (!player) doThrow(ctx, 'not a player')
    }
    let assertBuildMode = (player, needMode) => {
        assertPlayer(player)
        if (needMode && !isBuildMode(player)) doThrow(ctx, 'not in build mode')
        else if (!needMode && isBuildMode(player)) doThrow(ctx, 'already in build mode')
    }

    ServerEvents.commandRegistry(e => {
        // Internal.CommandContext<Internal.CommandSourceStack>
        const { commands: cmd, arguments: arg } = e

        let root = cmd.literal('buildMode')

        root.then(
            cmd.literal('on').executes(ctx => {
                let { player } = ctx.source
                assertBuildMode(player, false)

                let oldInventory = {
                    // ForgeCaps: { 'curios:inventory': player.nbt.ForgeCaps['curios:inventory'] },
                    Inventory: player.nbt.Inventory,
                }
                player.mergeNbt({
                    // ForgeCaps: { 'curios:inventory': {} }, // TODO: not working
                    Inventory: {},
                })
                player.persistentData.buildModeOldInv = oldInventory
                setBuildMode(player, true)
                player.server.runCommandSilent(`gamemode creative ${player.name.string}`)

                player.tell('entered build mode')
                return 1
            }),
        )
        root.then(
            cmd.literal('off').executes(ctx => {
                let { player } = ctx.source
                assertBuildMode(player, true)

                player.mergeNbt(player.persistentData.buildModeOldInv)
                setBuildMode(player, false)
                delete player.persistentData.buildModeOldInv
                player.server.runCommandSilent(`gamemode survival ${player.name.string}`)

                player.tell('quitted build mode')
                return 1
            }),
        )
        root.then(
            cmd.literal('usages').executes(ctx => {
                let { player } = ctx.source
                assertPlayer(player)

                player.tell(Text.gold('blocks in debt:'))
                let pool = player.persistentData.buildModeCounts || {}
                let hasContent = false
                for (let id in pool) {
                    player.tell(
                        Block.getBlock(id)
                            .getName()
                            .append(Text.white(`: ${pool[id]}`)),
                    )
                    hasContent = true
                }
                if (!hasContent) player.tell(Text.green('all clear!'))

                return 1
            }),
        )
        root.then(
            cmd.literal('pay').executes(ctx => {
                let {
                    player,
                    player: { inventory },
                } = ctx.source
                assertBuildMode(player, false)

                let pool = player.persistentData.buildModeCounts || {}
                let paid = {}
                for (let item of inventory.items) {
                    for (let id of [item.item.block?.id, item.id]) {
                        if (!id) continue
                        if (pool[id] > 0) {
                            let sub = Math.min(pool[id], item.count)
                            if (sub <= 0) continue
                            item.shrink(sub)
                            paid[id] = (paid[id] || 0) + sub
                            addUsage(player, id, -sub)
                            break
                        }
                    }
                }

                player.tell(Text.gold('blocks paid:'))
                let hasContent = false
                for (let id in paid) {
                    player.tell(
                        Block.getBlock(id)
                            .getName()
                            .append(Text.white(`: ${paid[id]}`)),
                    )
                    hasContent = true
                }
                if (!hasContent) player.tell(Text.gold('nothing!'))
                player.runCommandSilent(`buildMode usages`)

                return 1
            }),
        )

        e.register(root)
    })

    BlockEvents.placed(e => {
        let { player, block } = e
        if (!isBuildMode(player)) return
        addUsage(player, block.id)
    })

    BlockEvents.broken(e => {
        let { player, block } = e
        if (!isBuildMode(player)) return
        addUsage(player, block.id, -1)
    })
}
