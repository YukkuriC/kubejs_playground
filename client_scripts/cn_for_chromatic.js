// ignored: true
// 暴力替换汉化，但是要汉化的mod芜了
let langMap = JsonIO.read('kubejs/assets/createchromaticreturn/lang/zh_cn.json')
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
