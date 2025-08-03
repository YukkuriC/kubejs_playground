const $BreakEvent = Java.loadClass('net.minecraftforge.event.level.BlockEvent$BreakEvent')
const $IntegerProperty = Java.loadClass('net.minecraft.world.level.block.state.properties.IntegerProperty')

const EVENT_BUS = ForgeEvents.eventBus()
global.EVENT_BUS = EVENT_BUS

global.STARTUP_SCOPE = this
