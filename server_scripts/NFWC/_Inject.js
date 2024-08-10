ServerEvents.lowPriorityData(e => {
    InjectFunc(organPlayerDamageOnlyStrategies, 'kubejs:the_third_eye', INJECTORS.DAMAGE.THIRD_EYE)
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
}
