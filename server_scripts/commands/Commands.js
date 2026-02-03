ServerEvents.commandRegistry(e => {
    const { commands: cmd, arguments: arg } = e

    // 玩家数据操作系列
    {
        let F = cmd.literal('F').requires(src => src.hasPermission(2))

        // 附魔操作
        {
            let enchantKeys = ['Enchantments', 'StoredEnchantments']

            let getEnchantPool = (item, returnKey) => {
                if (!item) return
                let tag = item.getOrCreateTag()
                for (let key of enchantKeys) {
                    if (tag[key] && tag[key].length > 0) return returnKey ? key : tag[key]
                }
            }
            CommandUtils.chain(
                [
                    F, // /F
                    cmd.literal('enchant'),
                    cmd.argument('type', arg.STRING.create(e)),
                    cmd.argument('level', arg.INTEGER.create(e)),
                ],
                ctx => {
                    let item = CommandUtils.getPlayerItem(ctx)
                    if (!item) return 0

                    let type = arg.STRING.getResult(ctx, 'type')
                    if (type.indexOf(':') < 0) type = 'minecraft:' + type
                    let level = CommandUtils.tryGetArg(ctx, arg.INTEGER, 'level') || 1
                    Utils.server.tell(`Enchanting ${type} Lv.${level}`)
                    if (item.id == 'minecraft:enchanted_book') item.getOrCreateTag().StoredEnchantments.push({ id: type, lvl: level })
                    else item.enchantStack(type, level)
                    return 1
                },
                2,
            )
            CommandUtils.chain(
                [
                    F, // /F
                    cmd.literal('enchant_remove'),
                    cmd.argument('type', arg.STRING.create(e)),
                ],
                [
                    ctx => {
                        let pool = getEnchantPool(CommandUtils.getPlayerItem(ctx))
                        if (!pool) return 0
                        Utils.server.tell(`Removing ${pool.length} enchantments`)
                        pool.clear()
                        return 1
                    },
                    ctx => {
                        let item = CommandUtils.getPlayerItem(ctx)
                        let tag = item.getOrCreateTag()
                        let key = getEnchantPool(item, true)
                        let pool = tag[key]
                        if (!pool) return 0
                        let type = arg.STRING.getResult(ctx, 'type')
                        Utils.server.tell(`Removing ${type} enchantments`)
                        pool = pool.filter(x => x.id != type && x.id != `minecraft:${type}`)
                        tag[key] = pool
                        return 1
                    },
                ],
                2,
            )
            CommandUtils.chain(
                [
                    F, // /F
                    cmd.literal('enchant_dump'),
                ],
                ctx => {
                    let player = CommandUtils.getPlayer(ctx)
                    if (!player) return 0
                    let pool = getEnchantPool(player.getMainHandItem())
                    if (!pool) return 0
                    Utils.server.tell(`Dumping ${pool.length} enchantment(s)`)
                    let book = Item.of('enchanted_book')
                    book.getOrCreateTag().merge({ StoredEnchantments: pool })
                    player.give(book)
                    return 1
                },
            )
            CommandUtils.chain(
                [
                    F, // /F
                    cmd.literal('enchant_merge'),
                ],
                ctx => {
                    let player = CommandUtils.getPlayer(ctx)
                    if (!player) return 0
                    let pool = getEnchantPool(player.getMainHandItem()),
                        poolOffhand = getEnchantPool(player.getOffhandItem())
                    if (!poolOffhand) return (Utils.server.tell('No enchantments in offhand'), 0)
                    if (!pool) {
                        let item = player.getMainHandItem()
                        let key = item.id == 'minecraft:enchanted_book' ? 'StoredEnchantments' : 'Enchantments'
                        let tag = item.getOrCreateTag()
                        tag[key] = []
                        pool = tag[key]
                    }
                    Utils.server.tell(`Merging ${poolOffhand.length} enchantment(s)`)

                    let mapType = {}
                    for (let e of pool) {
                        if (mapType[e.id]) continue
                        mapType[e.id] = e
                    }
                    for (let e of poolOffhand) {
                        let { id, lvl } = e
                        if (!mapType[id]) {
                            pool.push(e)
                            continue
                        } else if (lvl == mapType[id].lvl) lvl++
                        mapType[id].lvl = Math.max(mapType[id].lvl, lvl)
                    }
                    return 1
                },
            )
        }

        // 重命名
        {
            CommandUtils.chain(
                [
                    F, // /F
                    cmd.literal('rename'),
                    cmd.argument('name', arg.GREEDY_STRING.create(e)),
                ],
                ctx => {
                    let item = CommandUtils.getPlayerItem(ctx)
                    if (!item || item.id == 'minecraft:air') return 0
                    let newName = arg.GREEDY_STRING.getResult(ctx, 'name')
                    newName = newName.replace('\\', '\\\\').replace('"', '\\"') // 这是Java String，不是js string
                    item.orCreateTag.display = { Name: `{"text":"${newName}"}` }
                    return 1
                },
            )
        }

        // 袭击冷却
        {
            CommandUtils.chain(
                [
                    F, // /F
                    cmd.literal('raidCD'),
                ],
                ctx => {
                    let player = CommandUtils.getPlayer(ctx)
                    if (!player) return 0
                    let raid = player.level.getRaidAt(BlockPos(player.x, player.y, player.z))
                    if (!raid) return 0
                    global.setField(raid, 'f_37684_', Integer('1'))
                    player.level.raids.setDirty()
                    return 1
                },
            )
        }

        // 原油储量
        if (Platform.isLoaded('createdieselgenerators')) {
            let ChunkPos = Java.loadClass('net.minecraft.world.level.ChunkPos')
            let OilChunksSavedData = Java.loadClass('com.jesz.createdieselgenerators.world.OilChunksSavedData')

            let GetOilData = ctx => {
                let ret = {
                    player: CommandUtils.getPlayer(ctx),
                    save: OilChunksSavedData.load(ctx.source.level),
                }
                ret.cp = new ChunkPos(ret.player.blockPosition())
                return ret
            }

            CommandUtils.chain(
                [
                    F, // /F
                    cmd.literal('cdg_oil_amount'),
                    cmd.argument('amount', arg.INTEGER.create(e)),
                ],
                [
                    ctx => {
                        let { player, cp, save } = GetOilData(ctx)
                        player.tell(`amount: ${save.getChunkOilAmount(cp)}`)
                        return 1
                    },
                    ctx => {
                        let { player, cp, save } = GetOilData(ctx)
                        let newValue = arg.INTEGER.getResult(ctx, 'amount')
                        save.setChunkAmount(cp, newValue)
                        player.tell(`new amount: ${newValue}`)
                        return 1
                    },
                ],
                2,
            )
        }

        e.register(F)
    }
})
