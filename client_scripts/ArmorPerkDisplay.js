ItemEvents.tooltip(reg => {
    for (const slot of ['helmet', 'bodyarmor', 'pants', 'boots'])
        reg.addAdvanced(`mekanism:mekasuit_${slot}`, (stack, _, tooltip) => {
            try {
                // global.ARS.ItemsRegistry.BATTLEMAGE_HOOD.get().appendHoverText(item, Client.player.level, tooltip, flag)
                let perkProvider = global.ARS.PerkRegistry.getPerkProvider(stack.getItem())
                if (perkProvider != null) {
                    let idxBefore = tooltip.length
                    let armorPerkHolder = perkProvider.getPerkHolder(stack)
                    tooltip.add(Component.translatable('ars_nouveau.tier', String(armorPerkHolder.getTier() + 1)).gold())
                    perkProvider.getPerkHolder(stack).appendPerkTooltip(tooltip, stack)

                    // move to head
                    let idxAfter = tooltip.length
                    let tmp = []
                    for (let i = idxBefore; i < idxAfter; i++) tmp.push(tooltip[i])
                    for (let i = idxBefore; i < idxAfter; i++) tooltip.pop()
                    let idx = 1
                    for (let t of tmp) tooltip.add(idx++, t)
                }
            } catch (e) {
                Client.player.tell(e)
            }
        })
})
