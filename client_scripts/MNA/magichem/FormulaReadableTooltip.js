// requires: magichem

ItemEvents.tooltip(e => {
    // imports
    let { ADMIXTURE_JSON } = Java.loadClass('com.aranaira.magichem.registry.MateriaRegistry')
    let admixtureRaw = {}
    ADMIXTURE_JSON.get('admixtures').forEach(e => {
        let key = e.get('name').asString
        let data = []
        e.get('components').forEach(comp => {
            data.push([comp.get('admixture')?.asString, comp.get('essentia')?.asString, comp.get('count')])
        })
        admixtureRaw[key] = data
    })
    let SMALL_NUMS = ['\u2080', '\u2081', '\u2082', '\u2083', '\u2084', '\u2085', '\u2086', '\u2087', '\u2088', '\u2089']

    // cache tooltip
    let cachedFormula = {}
    let cachedFormulaDeep = {}
    let getFormula = (name, deep) => {
        let cacheMap = deep ? cachedFormulaDeep : cachedFormula
        if (!(name in cacheMap)) {
            let raw = admixtureRaw[name]
            if (!raw) return 'NOPE'
            let output = Text.darkAqua('')
            let first = true
            for (let [adm, ess, count] of raw) {
                if (!first) output.append(' ')
                if (adm) {
                    if (deep) {
                        output.append('(')
                        output.append(getFormula(adm, deep))
                        output.append(')')
                    } else {
                        output.append(Text.translate(`item.magichem.admixture_${adm}.short`))
                    }
                } else if (ess) {
                    output.append(Text.translate(`item.magichem.essentia_${ess}.short`))
                }
                if (deep || count > 1) {
                    output.append(Text[ess ? 'gold' : 'lightPurple'](toSmallNum(count)))
                }

                first = false
            }
            cacheMap[name] = output
        }
        return cacheMap[name]
    }
    let toSmallNum = num => {
        if (num < 10) return SMALL_NUMS[num]
        return toSmallNum(Math.floor(num / 10)) + SMALL_NUMS[num % 10]
    }

    e.addAdvancedToAll((stack, advanced, tooltips) => {
        let { id } = stack
        if (!id.startsWith('magichem:admixture_')) return
        let name = id.substring(19)
        try {
            let formula = getFormula(name, e.shift)
            tooltips.add(Text.translate('tooltip.magichem.admixture_formula').darkGray().append(' [ ').append(formula).append(' ]'))
        } catch (e) {
            tooltips.add(e)
        }
    })
})
