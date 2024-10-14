{
    let PatternRegistryPath = 'at.petrak.hexcasting.api.PatternRegistry'
    let PRClass = Java.loadClass(PatternRegistryPath)
    let PRRaw = global.loadRawClass(PatternRegistryPath)

    let mapStartDir = {}
    let mapLineDir = {}
    'NORTH_EAST,EAST,SOUTH_EAST,SOUTH_WEST,WEST,NORTH_WEST'.split(',').forEach((x, i) => (mapStartDir[x] = `${i}b`))
    Array.from('wedsaq').forEach((x, i) => (mapLineDir[x] = `${i}B`))
    let seq2bytes = seq =>
        Array.from(seq)
            .map(x => mapLineDir[x])
            .join(',')

    let mapPatterns = {}
    // map static class
    let staticMap = global.getField(PRRaw, 'regularPatternLookup', 1)
    for (let seq in staticMap) {
        let pattern = staticMap[seq]
        let op = pattern.opId()
        let startDir = pattern.preferredStart()
        let patternNBT = `{"hexcasting:data":{angles:[B;${seq2bytes(seq)}],start_dir:${
            mapStartDir[startDir]
        }},"hexcasting:type":"hexcasting:pattern"}`
        mapPatterns[op] = mapPatterns[op.path] = patternNBT
    }
    // map per-world patterns
    let server = Utils.server
    let perWorldMap = PRClass.getPerWorldPatterns(server.getLevel('overworld'))
    server.scheduleInTicks(10, () => {
        for (let seq in perWorldMap) {
            let pair = perWorldMap[seq]
            let op = pair.first
            let startDir = pair.second
            let patternNBT = `{"hexcasting:data":{angles:[B;${seq2bytes(seq)}],start_dir:${
                mapStartDir[startDir]
            }},"hexcasting:type":"hexcasting:pattern"}`
            mapPatterns[op] = mapPatterns[op.path] = patternNBT
        }
    })

    ServerEvents.commandRegistry(e => {
        const { commands: cmd, arguments: arg } = e
        const GetPlayer = ctx => {
            /**@type {Player}*/
            let player = ctx.source.entity
            if (player && player.isPlayer()) return player
        }
        const TEMPLATES = {
            pattern: '{"hexcasting:data":{angles:[B;@],start_dir:0b},"hexcasting:type":"hexcasting:pattern"}',
            list: '{"hexcasting:data":[@],"hexcasting:type":"hexcasting:list"}',
            num: '{"hexcasting:data":@,"hexcasting:type":"hexcasting:double"}',
        }

        e.register(
            cmd.literal('hexParse').then(
                cmd.argument('code', arg.STRING.create(e)).executes(ctx => {
                    let code = []
                    String(arg.STRING.getResult(ctx, 'code')).replace(/\(|\)|\[|\]|[\w\.\/]+/g, match => (code.push(match), ''))

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
                        else if (kw in mapPatterns) {
                            stack[0].push(mapPatterns[kw])
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
}
