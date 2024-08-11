ServerEvents.lowPriorityData(e => {
    InjectFunc(organPlayerDamageOnlyStrategies, 'kubejs:the_third_eye', INJECTORS.DAMAGE.THIRD_EYE)
    organPlayerEnchantOnlyStrategies['kubejs:pandora_active'] = organPlayerEnchantOnlyStrategies['kubejs:pandora_inactive'] =
        INJECTORS.ENCHANT.PANDORA
})

function InjectFunc(container, key, append) {
    container[key] = (f => (arg0, arg1, arg2) => {
        f(arg0, arg1, arg2)
        append(arg0, arg1, arg2)
    })(container[key])
}

const INJECTORS = {
    DAMAGE: {
        THIRD_EYE: (event, organ, data) => {
            // organPlayerDamageOnlyStrategies['kubejs:lost_paradise'](event, organ, data)
            let player = event.source.player
            updateWarpCount(player, player.persistentData.getInt(warpCount) + 5)
        },
    },
    ENCHANT: {
        PANDORA: function (event, organ) {
            for (let slot = 0; slot < 3; slot++) {
                let enchantSlot = event.get(slot)
                let allLevel = 0
                enchantSlot.forEachEnchantments((enchantment, level) => {
                    if (level >= 5) level = 7
                    else if (level >= 3) level = 5
                    allLevel = allLevel + level
                })
                let needEnchantList = []
                enchantSlot.forEachEnchantments((enchantment, level) => {
                    needEnchantList.push(enchantment)
                })
                enchantSlot.clearEnchantments()
                needEnchantList.forEach(needEnchant => {
                    enchantSlot.addEnchantment(needEnchant, allLevel)
                })
                enchantSlot.updateClue()
            }
            if (Math.random() < 0.2) {
                let count = event.player.persistentData.getInt(warpCount) ?? 0
                updateWarpCount(event.player, count + 1)
            }
        },
    },
}
