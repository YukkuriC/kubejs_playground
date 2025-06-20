// requires: goety
{
    let ArcaBlockEntity = Java.loadClass('com.Polarice3.Goety.common.blocks.entities.ArcaBlockEntity')
    let IEnergyStorage = Java.loadClass('net.minecraftforge.energy.IEnergyStorage')
    let IItemHandler = Java.loadClass('net.minecraftforge.items.IItemHandler')
    let { ENERGY: FECap, ITEM_HANDLER: ItemCap } = Java.loadClass('net.minecraftforge.common.capabilities.ForgeCapabilities')
    let SEHelper = Java.loadClass('com.Polarice3.Goety.utils.SEHelper')
    let MainConfig = Java.loadClass('com.Polarice3.Goety.config.MainConfig')
    let LazyOptional = Java.loadClass('net.minecraftforge.common.util.LazyOptional')

    let RATE = 200
    let RATE_EXTRACT_LOSS = 0.1
    /**@type {Internal.IEnergyStorage & {arca:Internal.ArcaBlockEntity}}*/
    let protoFE = {
        getSoul() {
            if (!this.arca.player) return 0
            return SEHelper.getSESouls(this.arca.player)
        },
        getMaxSoul() {
            if (!this.arca.player) return 0
            return MainConfig.MaxArcaSouls.get()
        },
        setSoul(newSoul) {
            if (!this.arca.player) return
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

    /**@type {Internal.IItemHandler & {arca:Internal.ArcaBlockEntity}}*/
    let protoItem = {
        getSlots() {
            let inv = this.arca.player?.inventory
            if (!inv) return 0
            return inv.slots
        },
        getStackInSlot(slot) {
            let inv = this.arca.player?.inventory
            if (!inv) return Item.empty
            return inv.getStackInSlot(slot)
        },
        insertItem(slot, stack, simulate) {
            let player = this.arca.player
            if (!player) return stack
            if (!simulate) player.give(stack)
            return Item.empty
        },
        extractItem(slot, amount, simulate) {
            return Item.empty
        },
        getSlotLimit(slot) {
            return 114514
        },
        isItemValid(slot, stack) {
            return true
        },
    }

    let doArcaInject = (/**@type {Internal.AttachCapabilitiesEvent<Internal.BlockEntity>}*/ event) => {
        let be = event.getObject()
        try {
            if (!(be instanceof ArcaBlockEntity)) return
            event.addCapability('kubejs:arca_fe', (cap, side) => {
                if (cap == FECap)
                    return LazyOptional.of(
                        () =>
                            new JavaAdapter(IEnergyStorage, {
                                arca: be,
                                __proto__: protoFE,
                            }),
                    )
                else if (cap == ItemCap)
                    return LazyOptional.of(
                        () =>
                            new JavaAdapter(IItemHandler, {
                                arca: be,
                                __proto__: protoItem,
                            }),
                    )
                return LazyOptional.empty()
            })
        } catch (e) {
            if (Utils.server) Utils.server.tell(e)
        }
    }

    // load event
    if (Platform.isLoaded('eventjs')) {
        // https://github.com/ZZZank/EventJS/issues/1
        let [clsEvent, clsType] = ['net.minecraftforge.event.AttachCapabilitiesEvent', 'net.minecraft.world.level.block.entity.BlockEntity']
        if (Platform.getInfo('eventjs').version < '1.4.1') [clsEvent, clsType] = [clsType, clsEvent]
        ForgeEvents.onGenericEvent(clsEvent, clsType, doArcaInject)
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
