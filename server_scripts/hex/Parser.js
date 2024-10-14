{
    let PatternRegistryPath = 'at.petrak.hexcasting.api.PatternRegistry'
    let PRClass = Java.loadClass(PatternRegistryPath)
    let PRRaw = global.loadRawClass(PatternRegistryPath)
    let Double = Java.loadClass('java.lang.Double')

    let mapStartDir = {}
    let mapLineDir = {}
    'NORTH_EAST,EAST,SOUTH_EAST,SOUTH_WEST,WEST,NORTH_WEST'.split(',').forEach((x, i) => (mapStartDir[x] = `${i}b`))
    Array.from('wedsaq').forEach((x, i) => (mapLineDir[x] = `${i}B`))
    let seq2bytes = seq =>
        Array.from(seq)
            .map(x => mapLineDir[x])
            .join(',')
    let toPattern = (seq, startDir) =>
        `{"hexcasting:data":{angles:[B;${seq2bytes(seq)}],start_dir:${mapStartDir[startDir]}},"hexcasting:type":"hexcasting:pattern"}`

    let mapPatterns = global.mapPatterns || {}
    let onLoad = (/**@type {Internal.CommandEventJS}*/ e) => {
        mapPatterns = global.mapPatterns = {
            escape: toPattern('qqqaw', 'WEST'),
            '(': toPattern('qqq', 'WEST'),
            ')': toPattern('eee', 'EAST'),
        }
        mapPatterns['\\'] = mapPatterns.escape
        // map static class
        let staticMap = global.getField(PRRaw, 'regularPatternLookup', 1)
        for (let seq in staticMap) {
            let pattern = staticMap[seq]
            let op = pattern.opId()
            let startDir = pattern.preferredStart()
            let patternNBT = toPattern(seq, startDir)
            mapPatterns[op] = mapPatterns[op.path] = patternNBT
        }
        // map per-world patterns
        let server = Utils.server
        let perWorldMap = PRClass.getPerWorldPatterns(server.getLevel('overworld'))
        for (let seq in perWorldMap) {
            let pair = perWorldMap[seq]
            let op = pair.first
            let startDir = pair.second
            let patternNBT = toPattern(seq, startDir)
            mapPatterns[op] = mapPatterns[op.path] = patternNBT
        }
    }
    ServerEvents.loaded(onLoad)
    ServerEvents.command('reload', onLoad)

    ServerEvents.commandRegistry(e => {
        const { commands: cmd, arguments: arg } = e
        const GetPlayer = ctx => {
            /**@type {Player}*/
            let player = ctx.source.entity
            if (player && player.isPlayer()) return player
        }
        const toList = lst => `{"hexcasting:data":[${lst.join(',')}],"hexcasting:type":"hexcasting:list"}`
        const toNum = num => `{"hexcasting:data":${num}d,"hexcasting:type":"hexcasting:double"}`
        const toVec = nums =>
            `{"hexcasting:data":[L;${nums
                .map(x => Double.doubleToRawLongBits(x).toString() + 'L')
                .join(',')}],"hexcasting:type":"hexcasting:vec3"}`

        e.register(
            cmd.literal('hexParse').then(
                cmd.argument('code', arg.STRING.create(e)).executes(ctx => {
                    let code = []
                    String(arg.STRING.getResult(ctx, 'code')).replace(/\\|\(|\)|\[|\]|[\w\.\/]+/g, match => (code.push(match), ''))

                    let stack = [[]]
                    for (let kw of code) {
                        // nested list
                        if (kw == '[') {
                            stack.unshift([])
                        } else if (kw == ']') {
                            let inner = stack.shift()
                            stack[0].push(toList(inner))
                        }
                        // normal kw
                        else if (kw in mapPatterns) {
                            stack[0].push(mapPatterns[kw])
                        }

                        // num pattern by escape
                        else if (kw.startsWith('num_')) {
                            let num = Number(kw.substring(4)) || 0
                            stack[0].push(mapPatterns.escape)
                            stack[0].push(toNum(num))
                        }
                        // num literal
                        else if (kw.match(/^[0-9\.\-]+(e[0-9\.\-]+)?$/)) {
                            let num = Number(kw) || 0
                            stack[0].push(toNum(num))
                        }

                        // vec literals
                        else if (kw.startsWith('vec_')) {
                            let raw = kw.split('_')
                            let nums = [1, 2, 3].map(x => Number(raw[x]) || 0)
                            // TODO use builtin consts
                            stack[0].push(toVec(nums))
                        }

                        // else
                        else {
                            Utils.server.tell(`unknown keyword: ${kw}`)
                        }
                    }

                    // parse to item
                    let player = GetPlayer(ctx)
                    let target = null
                    if (player.mainHandItem.id == 'hexcasting:focus') target = player.mainHandItem
                    else if (player.offhandItem.id == 'hexcasting:focus') target = player.offhandItem
                    if (target) {
                        let fooItem = Item.of('hexcasting:focus', `{data:${toList(stack[0])}}`)
                        target.orCreateTag.data = fooItem.nbt.data
                    }
                    return 114514
                }),
            ),
        )
    })
}
