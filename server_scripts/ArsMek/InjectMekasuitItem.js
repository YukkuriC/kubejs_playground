// requires: mekanism
// requires: ars_nouveau

// inject on fibers edited
EntityEvents.spawned('minecraft:item', e => {
    let item = e.entity.item
    if (!item.id.startsWith('mekanism:mekasuit_')) return
    global.InjectMekasuit(item)
})
for (const slot of ['helmet', 'bodyarmor', 'pants', 'boots'])
    PlayerEvents.inventoryChanged(`mekanism:mekasuit_${slot}`, e => global.InjectMekasuit(e.item))

global.InjectMekasuit = (stack, slot) => {
    if (!slot) slot = Client.player.getEquipmentSlotForItem(stack)
    let ARS = global.ARS,
        MEK = global.MEK

    for (let pool of [ARS, MEK]) if (!pool.SUIT) pool.SUIT = pool.SUIT_BASE().map(x => x.get()) // grab cache

    if (stack.nbt) delete stack.nbt.AttributeModifiers
    let mainMap = MEK.SUIT[slot.getIndex()].getAttributeModifiers(slot, stack)
    for (let pair of mainMap.entries()) {
        let { key, value } = pair
        stack.addAttributeModifier(key, value, slot)
    }
    let attrMap = ARS.SUIT[slot.getIndex()].getAttributeModifiers(slot, stack)
    for (let pair of attrMap.entries()) {
        let { key, value } = pair
        if (value.name.startsWith('Armor ')) {
            continue
        }
        stack.addAttributeModifier(key, value, slot)
    }
}
