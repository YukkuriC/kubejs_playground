// requires: scguns

ItemEvents.tooltip(e => {
    let Screen = Java.loadClass('net.minecraft.client.gui.screens.Screen')
    let wrapFloat = num => Math.round(num * 100) / 100

    for (let gunId of Ingredient.of('@scguns').itemIds) {
        /**@type {Internal.GunItem} */
        let gunItem = Item.of(gunId).item
        if (!gunItem.getModifiedGun) continue
        e.addAdvanced(gunId, (stack, advanced, tooltips) => {
            // if (!Screen.hasShiftDown()) return
            let gun = gunItem.getModifiedGun(stack)
            let additional = [
                //
                Text.literal(`rate: ${gun.general.rate}`),
                Text.literal(`spread: ${wrapFloat(gun.general.spread)}`),
                Text.literal(`recoil: ${wrapFloat(gun.general.recoilAngle)}↔;${wrapFloat(gun.general.recoilKick)}↓`),
            ]
            if (gun.general.burstAmount > 0) additional.push(Text.literal(`burstAmount: ${gun.general.burstAmount}`))
            if (gun.general.projectileAmount > 1)
                additional.push(Text.literal(`projectileAmount: ${gun.general.projectileAmount}`))
            tooltips.addAll(6, additional)
        })
    }
})
