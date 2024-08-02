const EVENT_BUS = ForgeEvents.eventBus()
global.EVENT_BUS = EVENT_BUS

const $MobEffectInstance = Java.loadClass('net.minecraft.world.effect.MobEffectInstance')
const $Player = Java.loadClass('net.minecraft.world.entity.player.Player')
