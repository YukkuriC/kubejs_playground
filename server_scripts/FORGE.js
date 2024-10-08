const $BreakEvent = Java.loadClass('net.minecraftforge.event.level.BlockEvent$BreakEvent')
const $CocoaBlock = Java.loadClass('net.minecraft.world.level.block.CocoaBlock')
const $EvokerFangs = Java.loadClass('net.minecraft.world.entity.projectile.EvokerFangs')
const $IntegerProperty = Java.loadClass('net.minecraft.world.level.block.state.properties.IntegerProperty')

global.SERVER_SCOPE = this
global.unlockClassFilter(Java)
