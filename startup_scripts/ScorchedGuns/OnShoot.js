// requires: scguns

ForgeEvents.onEvent('top.ribs.scguns.event.GunFireEvent$Post', e => {
    let { shooter, stack, client } = e

    // no ammo & durability
    let gun = stack.item.getModifiedGun(stack)
    Object.assign(stack.nbt, {
        AmmoCount: gun.reloads.maxAmmo,
        Damage: 0,
    })
    if (stack.nbt.Attachments) {
        for (let part of Object.values(stack.nbt.Attachments)) {
            part.tag.Damage = 0
        }
    }

    if (!client) {
        // reset fall distance
        if (shooter.pitch > 60) shooter.fallDistance = 0
    }
})
