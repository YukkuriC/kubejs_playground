// requires: create
if (!global.soulGogglesEnabled) {
    let GogglesItem = Java.loadClass('com.simibubi.create.content.equipment.goggles.GogglesItem')
    GogglesItem.addIsWearingPredicate(p => true)
    global.soulGogglesEnabled = true
}
