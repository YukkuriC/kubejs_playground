// requires: goety
{
    let ArcaBlockEntity = Java.loadClass('com.Polarice3.Goety.common.blocks.entities.ArcaBlockEntity')
    let IEnergyStorage = Java.loadClass('net.minecraftforge.energy.IEnergyStorage')
    let FECap = Java.loadClass('net.minecraftforge.common.capabilities.ForgeCapabilities').ENERGY
    let SEHelper = Java.loadClass('com.Polarice3.Goety.utils.SEHelper')
    let MainConfig = Java.loadClass('com.Polarice3.Goety.config.MainConfig')
    let LazyOptional = Java.loadClass('net.minecraftforge.common.util.LazyOptional')

    let RATE = 1000
    let RATE_EXTRACT_LOSS = 0.1
    let protoFE = {
        getSoul() {
            return SEHelper.getSESouls(this.arca.player)
        },
        getMaxSoul() {
            if (!this.arca.player) return 0
            return MainConfig.MaxArcaSouls.get()
        },
        setSoul(newSoul) {
            SEHelper.setSESouls(this.arca.player, newSoul)
            SEHelper.sendSEUpdatePacket(this.arca.player)
        },

        receiveEnergy(maxReceive, simulate) {
            let receiveSoul = maxReceive / RATE
            let oldSoul = this.getSoul()
            let newSoul = Math.min(this.getMaxSoul(), oldSoul + receiveSoul)
            let delta = newSoul - oldSoul
            if (!simulate) this.setSoul(newSoul)
            return RATE * delta
        },
        extractEnergy(maxExtract, simulate) {
            let extractSoul = maxExtract / RATE
            let loseSoulReal = extractSoul * (1 + RATE_EXTRACT_LOSS)
            let oldSoul = this.getSoul()
            let newSoul = Math.max(0, oldSoul - loseSoulReal)
            let delta = (oldSoul - newSoul) / (1 + RATE_EXTRACT_LOSS)
            if (!simulate) this.setSoul(newSoul)
            return RATE * delta
        },
        getEnergyStored() {
            return RATE * this.getSoul()
        },
        getMaxEnergyStored() {
            return RATE * this.getMaxSoul()
        },
        canExtract() {
            return true
        },
        canReceive() {
            return true
        },
    }
    let doArcaInject = (/**@type {Internal.AttachCapabilitiesEvent<Internal.BlockEntity>}*/ event) => {
        let be = event.getObject()
        try {
            if (!(be instanceof ArcaBlockEntity)) return
            event.addCapability('kubejs:arca_fe', (cap, side) => {
                if (cap !== FECap) return LazyOptional.empty()
                return LazyOptional.of(() => {
                    return new JavaAdapter(IEnergyStorage, {
                        arca: be,
                        __proto__: protoFE,
                    })
                })
            })
        } catch (e) {
            if (Utils.server) Utils.server.tell(e)
        }
    }

    // load event
    if (Platform.isLoaded('eventjs')) {
        // TODO: reversed until 1.4.1
        // https://github.com/ZZZank/EventJS/issues/1
        ForgeEvents.onGenericEvent(
            'net.minecraft.world.level.block.entity.BlockEntity',
            'net.minecraftforge.event.AttachCapabilitiesEvent',
            doArcaInject,
        )
    } else {
        global.doArcaInject = doArcaInject
        ForgeEvents.onGenericEvent(
            'net.minecraftforge.event.AttachCapabilitiesEvent',
            'net.minecraft.world.level.block.entity.BlockEntity',
            e => {
                global.doArcaInject(e)
            },
        )
    }
}
