{
    let isBuildMode = player => player.persistentData.buildModeActive
    let setBuildMode = (player, flag) => (player.persistentData.buildModeActive = flag)

    let addUsage = (player, blockId, count) => {
        if (blockId == 'minecraft:air') return
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
        Utils.server.tell(`unknown id: ${block.id}`)
        return 'minecraft:barrier'
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
        if (player) player.tell(Text.red(text))
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

        /**@type Record<string, Internal.LiteralArgumentBuilder<Internal.CommandSourceStack>>*/
        let subMap = {}
        let makeSub = name => {
            return (subMap[name] = cmd.literal(name))
        }

        // folded sub functions
        let subs = [
            makeSub('on').executes(ctx => {
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

                if (Platform.isLoaded('create')) {
                    player.offHandItem = Item.of('create:extendo_grip', { Unbreakable: 1 }).enchant('unbreaking', 10)
                    player.give('create:wrench')
                }
                if (Platform.isLoaded('botania')) {
                    player.give('botania:astrolabe')
                }

                player.tell('entered build mode')
                return 1
            }),
            makeSub('off').executes(ctx => {
                let { player } = ctx.source
                assertBuildMode(player, true)

                player.mergeNbt(player.persistentData.buildModeOldInv)
                setBuildMode(player, false)
                delete player.persistentData.buildModeOldInv
                player.server.runCommandSilent(`gamemode survival ${player.name.string}`)

                player.tell('quitted build mode')
                return 1
            }),
            makeSub('usages').executes(ctx => {
                let { player } = ctx.source
                assertPlayer(player)

                player.tell(Text.gold('blocks in debt:'))
                let pool = player.persistentData.buildModeCounts || {}
                if (!displayItemPool(player, pool)) player.tell(Text.green('all clear!'))

                return 1
            }),
            makeSub('reset')
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
            makeSub('pay').executes(ctx => {
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
                    }
                }

                player.tell(Text.gold('blocks paid:'))
                if (!displayItemPool(player, paid)) player.tell(Text.gold('nothing!'))
                player.runCommandSilent(`buildMode usages`)

                return 1
            }),
            makeSub('refresh').executes(ctx => {
                let {
                    player,
                    player: { inventory },
                } = ctx.source
                assertBuildMode(player, true)
                player.runCommandSilent(`buildMode off`)
                player.runCommandSilent(`buildMode on`)
                player.tell(Text.green('refreshed!'))
                return 1
            }),
        ]
        for (let sub of subs) root.then(sub)

        // denying debt requires permission
        subMap.reset

        // dump to clipboard
        if (Platform.isLoaded('create')) {
            let MaterialChecklist = Java.loadClass('com.simibubi.create.content.schematics.cannon.MaterialChecklist')
            let ItemRequirement = Java.loadClass('com.simibubi.create.content.schematics.requirement.ItemRequirement')
            let cRequirement = ItemRequirement.__javaObject__.getConstructor(
                ItemRequirement.ItemUseType,
                Java.loadClass('net.minecraft.world.item.ItemStack'),
            )
            // let ItemUseType = ItemRequirement.ItemUseType
            // ItemRequirement.__javaObject__.getConstructor
            cRequirement.newInstance(ItemRequirement.ItemUseType.CONSUME, Item.of('air'))

            root.then(
                cmd.literal('clipboard').executes(ctx => {
                    let { player } = ctx.source
                    assertPlayer(player)

                    if (!MaterialChecklist) doThrow(player, 'clipboard logic load failed!')

                    let board = player.mainHandItem
                    if (board.id != 'create:clipboard') board = player.offHandItem
                    if (board.id != 'create:clipboard') doThrow(player, 'clipboard not in hand!')

                    let list = new MaterialChecklist()
                    let pool = player.persistentData.buildModeCounts || {}
                    for (let id in pool) {
                        let item = Item.of(id, pool[id])
                        list.require(cRequirement.newInstance(ItemRequirement.ItemUseType.CONSUME, item))
                    }
                    let newBoard = list.createWrittenClipboard()
                    board.nbt = newBoard.nbt
                    player.tell(Text.yellow('usages copied!'))
                    return 0
                }),
            )
        }

        e.register(root)
    })

    BlockEvents.placed(e => {
        let { player, block } = e
        if (!isBuildMode(player)) return
        if (Platform.isLoaded('create') && player.mainHandItem.id == 'create:wrench') return
        addUsage(player, getIdFromBlock(block))
    })

    BlockEvents.broken(e => {
        let { player, block } = e
        if (!isBuildMode(player)) return
        addUsage(player, getIdFromBlock(block), -1)
    })
}
