const $BreakEvent = Java.loadClass('net.neoforged.neoforge.event.level.BlockEvent$BreakEvent')
const $IntegerProperty = Java.loadClass('net.minecraft.world.level.block.state.properties.IntegerProperty')

const EVENT_BUS = NativeEvents.eventBus()
global.EVENT_BUS = EVENT_BUS

global.STARTUP_SCOPE = this
