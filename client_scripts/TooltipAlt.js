let MODE = 'write'

// step 1: walk through all tooltips
if (MODE == 'read') {
    this.langMap = {}
    ItemEvents.tooltip(e => {
        for (let item of Item.list) {
            if (item.idLocation.namespace !== 'createchromaticreturn') continue
            e.addAdvanced(item, (itemStack, isAdvanced, lines) => {
                lines.shift()
                for (let l of lines) {
                    Client.player.tell(l.string)
                    langMap[l.string] = l.string
                }
            })
        }
    })
}

// step 2: dump string
// JsonIO.write('kubejs/assets/createchromaticreturn/lang/zh_cn.json', langMap)

// step 3: replace back
else if (MODE == 'write') {
    this.langMap = JsonIO.read('kubejs/assets/createchromaticreturn/lang/zh_cn.json')
    ItemEvents.tooltip(e => {
        for (let item of Item.list) {
            if (item.idLocation.namespace !== 'createchromaticreturn') continue
            e.addAdvanced(item, (itemStack, isAdvanced, lines) => {
                lines.replaceAll(l => {
                    let key = l.string
                    if (key in langMap) {
                        return Text.of(langMap[key])
                    }
                    return l
                })
            })
        }
    })
}
