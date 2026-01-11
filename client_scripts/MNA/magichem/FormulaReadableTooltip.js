// requires: magichem
// ignored: true
// moved to MNAOverpowered

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
                        output.append(Text.translate(`item.magichem.admixture_${adm}.truncated`))
                    }
                } else if (ess) {
                    output.append(Text.translate(`item.magichem.essentia_${ess}.truncated`))
                }
                if (deep || count > 1) {
                    output.append(Text[ess ? 'gold' : 'lightPurple'](MagiChemLib.toSmallNum(count)))
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
                output.append(Text.translate(`item.magichem.essentia_${ess}.truncated`))
                if (count > 1) output.append(Text.gold(MagiChemLib.toSmallNum(count)))
                first = false
            }
            cachedAdmixtureCountsDisplay[name] = output
        }
        return cachedAdmixtureCountsDisplay[name]
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
