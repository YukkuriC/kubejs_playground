// requires: magichem

ItemEvents.tooltip(e => {
    // imports
    let { ADMIXTURE_JSON } = Java.loadClass('com.aranaira.magichem.registry.MateriaRegistry')
    let admixtureRaw = {}
    ADMIXTURE_JSON.get('admixtures').forEach(e => {
        let key = e.get('name').asString
        let data = []
        e.get('components').forEach(comp => {
            data.push([comp.get('admixture')?.asString, comp.get('essentia')?.asString, Number(comp.get('count'))])
        })
        admixtureRaw[key] = data
    })
    let SMALL_NUMS = ['\u2080', '\u2081', '\u2082', '\u2083', '\u2084', '\u2085', '\u2086', '\u2087', '\u2088', '\u2089']

    // cache tooltip
    let cachedFormula = {}
    let cachedFormulaDeep = {}
    let cachedAdmixtureCounts = {}
    let cachedAdmixtureCountsDisplay = {}
    let getFormula = (name, deep) => {
        let cacheMap = deep ? cachedFormulaDeep : cachedFormula
        if (!(name in cacheMap)) {
            let raw = admixtureRaw[name]
            if (!raw) return 'NOPE'
            let output = Text.darkAqua('')
            cacheMap[name] = output
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
        }
        return cacheMap[name]
    }
    let getEssentiaCounts = name => {
        let raw = admixtureRaw[name]
        if (!raw) return 'NOPE'
        if (!(name in cachedAdmixtureCounts)) {
            let res = {}
            cachedAdmixtureCounts[name] = res
            for (let [adm, ess, count] of raw) {
                if (adm) {
                    for (let [ee, cc] of Object.entries(getEssentiaCounts(adm))) {
                        res[ee] = (res[ee] || 0) + cc * count
                    }
                } else if (ess) {
                    res[ess] = (res[ess] || 0) + count
                }
            }
        }
        return cachedAdmixtureCounts[name]
    }
    let getEssentiaCountsDisplay = name => {
        let raw = admixtureRaw[name]
        if (!raw) return 'NOPE'
        if (!(name in cachedAdmixtureCountsDisplay)) {
            let output = Text.darkAqua('')
            let first = true
            for (let [ess, count] of Object.entries(getEssentiaCounts(name))) {
                if (!first) output.append(' ')
                output.append(Text.translate(`item.magichem.essentia_${ess}.short`))
                if (count > 1) output.append(Text.gold(toSmallNum(count)))
                first = false
            }
            cachedAdmixtureCountsDisplay[name] = output
        }
        return cachedAdmixtureCountsDisplay[name]
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
            if (e.shift) {
                let counts = getEssentiaCountsDisplay(name)
                tooltips.add(Text.darkGray('= [ ').append(counts).append(' ]'))
            }
        } catch (e) {
            tooltips.add(e)
        }
    })
})
