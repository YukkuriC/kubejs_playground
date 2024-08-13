ServerEvents.commandRegistry(e => {
    const { commands: cmd, arguments: arg } = e

    const TryGetArg = (ctx, argType, name) => {
        try {
            return argType.getResult(ctx, name)
        } catch (e) {}
    }
    const GetPlayer = ctx => {
        /**@type {Internal.Player}*/
        let player = ctx.source.entity
        if (player && player.isPlayer()) return player
    }
    const GetPlayerItem = ctx => {
        /**@type {Internal.Player}*/
        let player = GetPlayer(ctx)
        if (player) return player.getMainHandItem()
    }

    // 玩家数据操作系列
    {
        let F = cmd.literal('F').requires(src => src.hasPermission(2))

        // 附魔操作
        {
            let doEnchant = ctx => {
                let item = GetPlayerItem(ctx)
                if (!item) return 0

                let type = arg.STRING.getResult(ctx, 'type')
                let level = TryGetArg(ctx, arg.INTEGER, 'level') || 1
                Client.player.tell(`Enchanting ${type} Lv.${level}`)
                return item.enchantStack(type, level), 1
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
                        let item = GetPlayerItem(ctx)
                        if (!item) return 0
                        let tag = item.getOrCreateTag()
                        if (!tag.Enchantments) return 0
                        tag.remove('Enchantments')
                        Client.player.tell(`Removing enchantments`)
                        return 1
                    })
                    .then(
                        cmd.argument('type', arg.STRING.create(e)).executes(ctx => {
                            let item = GetPlayerItem(ctx)
                            if (!item) return 0
                            let type = arg.STRING.getResult(ctx, 'type')
                            let tag = item.getOrCreateTag()
                            if (!tag.Enchantments) return 0
                            tag.Enchantments = tag.Enchantments.filter(x => x.id != type && x.id != `minecraft:${type}`)
                            Client.player.tell(`Removing ${type} enchantments`)
                            return 1
                        }),
                    ),
            )
        }

        e.register(F)
    }
})
