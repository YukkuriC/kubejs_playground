ServerEvents.commandRegistry(e => {
    const { commands: cmd, arguments: arg } = e

    const TryGetArg = (ctx, argType, name) => {
        try {
            return argType.getResult(ctx, name)
        } catch (e) {}
    }
    const GetPlayer = ctx => {
        /**@type {Player}*/
        let player = ctx.source.entity
        if (player && player.isPlayer()) return player
    }
    const GetPlayerItem = ctx => {
        /**@type {Player}*/
        let player = GetPlayer(ctx)
        if (player) return player.getMainHandItem()
    }

    // 玩家数据操作系列
    {
        let F = cmd.literal('F').requires(src => src.hasPermission(2))

        // 附魔操作
        {
            let enchantKeys = ['Enchantments', 'StoredEnchantments']

            let doEnchant = ctx => {
                let item = GetPlayerItem(ctx)
                if (!item) return 0

                let type = arg.STRING.getResult(ctx, 'type')
                if (type.indexOf(':') < 0) type = 'minecraft:' + type
                let level = TryGetArg(ctx, arg.INTEGER, 'level') || 1
                Utils.server.tell(`Enchanting ${type} Lv.${level}`)
                if (item.id == 'minecraft:enchanted_book') item.getOrCreateTag().StoredEnchantments.push({ id: type, lvl: level })
                else item.enchantStack(type, level)
                return 1
            }
            let getEnchantPool = (item, returnKey) => {
                if (!item) return
                let tag = item.getOrCreateTag()
                for (let key of enchantKeys) {
                    if (tag[key] && tag[key].length > 0) return returnKey ? key : tag[key]
                }
            }
            F.then(
                cmd.literal('enchant').then(
                    cmd
                        .argument('type', arg.STRING.create(e))
                        .executes(doEnchant)
                        .then(cmd.argument('level', arg.INTEGER.create(e)).executes(doEnchant)),
                ),
            ).then(
                cmd
                    .literal('enchant_remove')
                    .executes(ctx => {
                        let pool = getEnchantPool(GetPlayerItem(ctx))
                        if (!pool) return 0
                        Utils.server.tell(`Removing ${pool.length} enchantments`)
                        pool.clear()
                        return 1
                    })
                    .then(
                        cmd.argument('type', arg.STRING.create(e)).executes(ctx => {
                            let item = GetPlayerItem(ctx)
                            let tag = item.getOrCreateTag()
                            let key = getEnchantPool(item, true)
                            let pool = tag[key]
                            if (!pool) return 0
                            let type = arg.STRING.getResult(ctx, 'type')
                            Utils.server.tell(`Removing ${type} enchantments`)
                            pool = pool.filter(x => x.id != type && x.id != `minecraft:${type}`)
                            tag[key] = pool
                            return 1
                        }),
                    ),
            )
            F.then(
                cmd.literal('enchant_dump').executes(ctx => {
                    let player = GetPlayer(ctx)
                    if (!player) return 0
                    let pool = getEnchantPool(player.getMainHandItem())
                    if (!pool) return 0
                    Utils.server.tell(`Dumping ${pool.length} enchantment(s)`)
                    let book = Item.of('enchanted_book')
                    book.getOrCreateTag().merge({ StoredEnchantments: pool })
                    player.give(book)
                    return 1
                }),
            ).then(
                cmd.literal('enchant_merge').executes(ctx => {
                    let player = GetPlayer(ctx)
                    if (!player) return 0
                    let pool = getEnchantPool(player.getMainHandItem()),
                        poolOffhand = getEnchantPool(player.getOffhandItem())
                    if (!poolOffhand) return Utils.server.tell('No enchantments in offhand'), 0
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
                }),
            )
        }

        // 重命名
        {
            F.then(
                cmd.literal('rename').then(
                    cmd.argument('name', arg.STRING.create(e)).executes(ctx => {
                        let item = GetPlayerItem(ctx)
                        if (!item || item.id == 'minecraft:air') return 0
                        let newName = arg.STRING.getResult(ctx, 'name')
                        newName = newName.replace('\\', '\\\\').replace('"', '\\"') // 这是Java String，不是js string
                        item.orCreateTag.display = { Name: `{"text":"${newName}"}` }
                        return 1
                    }),
                ),
            )
        }

        // 袭击冷却
        {
            F.then(
                cmd.literal('raidCD').executes(ctx => {
                    let player = GetPlayer(ctx)
                    if (!player) return 0
                    let raid = player.level.getRaidAt(BlockPos(player.x, player.y, player.z))
                    if (!raid) return
                    global.setField(raid, 'f_37684_', Integer('1'))
                    player.level.raids.setDirty()
                    return 1
                }),
            )
        }

        // 原油储量
        if (Platform.isLoaded('createdieselgenerators')) {
            let ChunkPos = Java.loadClass('net.minecraft.world.level.ChunkPos')
            let OilChunksSavedData = Java.loadClass('com.jesz.createdieselgenerators.world.OilChunksSavedData')

            let GetOilData = ctx => {
                let ret = {
                    player: GetPlayer(ctx),
                    save: OilChunksSavedData.load(ctx.source.level),
                }
                ret.cp = new ChunkPos(ret.player.blockPosition())
                return ret
            }

            F.then(
                cmd
                    .literal('cdg_oil_amount')
                    .then(
                        cmd.argument('amount', arg.INTEGER.create(e)).executes(ctx => {
                            let { player, cp, save } = GetOilData(ctx)
                            let newValue = arg.INTEGER.getResult(ctx, 'amount')
                            save.setChunkAmount(cp, newValue)
                            player.tell(`new amount: ${newValue}`)
                            return 1
                        }),
                    )
                    .executes(ctx => {
                        let { player, cp, save } = GetOilData(ctx)
                        player.tell(`amount: ${save.getChunkOilAmount(cp)}`)
                        return 1
                    }),
            )
        }

        e.register(F)
    }
})
