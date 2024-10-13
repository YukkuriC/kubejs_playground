ServerEvents.commandRegistry(e => {
    const { commands: cmd, arguments: arg } = e
    const GetPlayer = ctx => {
        /**@type {Player}*/
        let player = ctx.source.entity
        if (player && player.isPlayer()) return player
    }
    const GetPlayerItem = ctx => {
        /**@type {Player}*/
        let player = GetPlayer(ctx)
        if (player) return player.mainHandItem
    }
    const KWMap = {
        me: '5B,4B,5B',
        eye: '4B,4B',
        foot: '2B,2B',
        dir: '0B,4B',

        // ray tracing
        trace_block: '0B,5B,4B,4B,0B,2B,2B',
        trace_offset: '0B,1B,2B,2B,0B,4B,4B',
        trace_entity: '0B,1B,4B,5B,4B',

        // block op
        break: '5B,4B,5B,5B,5B,5B,5B',
        water: '4B,5B,4B,0B,5B,4B,2B,4B,5B',
        boom: '4B,4B,0B,4B,4B,0B,4B,4B',
        block: '5B,5B,4B',

        // meta
        escape: '5B,5B,5B,4B,0B',
        '(': '5B,5B,5B',
        ')': '1B,1B,1B',
        read: '4B,5B,5B,5B,5B,5B',
        write: '2B,1B,1B,1B,1B,1B',

        dupe: '4B,4B,2B,4B,4B',
        dupe2: '4B,4B,2B,4B,2B,4B,4B,0B',
        dupen: '4B,4B,2B,4B,4B,2B,4B,4B',
    }
    const TEMPLATES = {
        pattern: '{"hexcasting:data":{angles:[B;@],start_dir:0b},"hexcasting:type":"hexcasting:pattern"}',
        list: '{"hexcasting:data":[@],"hexcasting:type":"hexcasting:list"}',
        num: '{"hexcasting:data":@,"hexcasting:type":"hexcasting:double"}',
    }

    e.register(
        cmd.literal('hexParse').then(
            cmd.argument('code', arg.STRING.create(e)).executes(ctx => {
                let code = arg.STRING.getResult(ctx, 'code')
                    .split(' ')
                    .filter(x => x)

                let stack = [[]]
                for (let kw of code) {
                    // nested list
                    if (kw === '[') {
                        stack.unshift([])
                    } else if (kw === ']') {
                        let inner = stack.shift()
                        stack[0].push(TEMPLATES.list.replace('@', inner.join(',')))
                    }

                    // TODO num/vec literals
                    // TODO num pattern

                    // normal kw
                    else if (kw in KWMap) {
                        stack[0].push(TEMPLATES.pattern.replace('@', KWMap[kw]))
                    } else {
                        Utils.server.tell(`unknown keyword: ${kw}`)
                    }
                }

                // parse to item
                let player = GetPlayer(ctx)
                let target = null
                if (player.mainHandItem.id == 'hexcasting:focus') target = player.mainHandItem
                else if (player.offhandItem.id == 'hexcasting:focus') target = player.offhandItem
                if (target) {
                    let fooItem = Item.of('hexcasting:focus', `{data:${TEMPLATES.list.replace('@', stack[0].join(','))}}`)
                    target.orCreateTag.data = fooItem.nbt.data
                }
                return 114514
            }),
        ),
    )
})
