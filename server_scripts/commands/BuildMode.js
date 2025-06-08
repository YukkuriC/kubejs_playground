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

    let getIdFromBlock = (/**@type {Internal.BlockContainerJS}*/ block) => {
        let blockId = block.id
        let itemId = block.item?.id
        if (blockId == itemId) return blockId

        // try get drops
        let drops = block.getDrops()
        if (drops.length == 1 && drops[0].count == 1) return drops[0].id

        // you win
        return 'minecraft:bedrock'
    }

    let displayItemPool = (player, pool) => {
        let hasContent = false
        for (let id in pool) {
            let item = Item.of(id, pool[id])
            player.tell(item.displayName.append(Text.white(`: ${pool[id]}`)))
            hasContent = true
        }
        return hasContent
    }

    let doThrow = (player, text) => {
        player.tell(Text.red(text))
        throw text
    }
    let assertPlayer = player => {
        if (!player) doThrow(player, 'not a player')
    }
    let assertBuildMode = (player, needMode) => {
        assertPlayer(player)
        if (needMode && !isBuildMode(player)) doThrow(player, 'not in build mode')
        else if (!needMode && isBuildMode(player)) doThrow(player, 'already in build mode')
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
                if (!displayItemPool(player, pool)) player.tell(Text.green('all clear!'))

                return 1
            }),
        )
        root.then(
            cmd
                .literal('reset')
                .requires(src => src.hasPermission(2))
                .executes(ctx => {
                    let { player } = ctx.source
                    assertPlayer(player)
                    player.persistentData.buildModeResetSure = true
                    player.tell(Text.red('sure?'))
                    return 1
                })
                .then(
                    cmd
                        .literal('sure')
                        .requires(src => src.hasPermission(2) && !!src.player?.persistentData.buildModeResetSure)
                        .executes(ctx => {
                            let { player } = ctx.source
                            assertPlayer(player)
                            player.persistentData.buildModeCounts = {}
                            delete player.persistentData.buildModeResetSure
                            player.tell(Text.green('all clear!'))
                            return 1
                        }),
                ),
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
                    let { id } = item
                    if (pool[id] > 0) {
                        let sub = Math.min(pool[id], item.count)
                        if (sub <= 0) continue
                        item.shrink(sub)
                        paid[id] = (paid[id] || 0) + sub
                        addUsage(player, id, -sub)
                        break
                    }
                }

                player.tell(Text.gold('blocks paid:'))
                if (!displayItemPool(player, paid)) player.tell(Text.gold('nothing!'))
                player.runCommandSilent(`buildMode usages`)

                return 1
            }),
        )

        e.register(root)
    })

    BlockEvents.placed(e => {
        let { player, block } = e
        if (!isBuildMode(player)) return
        addUsage(player, getIdFromBlock(block))
    })

    BlockEvents.broken(e => {
        let { player, block } = e
        if (!isBuildMode(player)) return
        addUsage(player, getIdFromBlock(block), -1)
    })
}
