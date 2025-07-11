// requires: goety
{
    let ArcaBlockEntity = Java.loadClass('com.Polarice3.Goety.common.blocks.entities.ArcaBlockEntity')
    let IEnergyStorage = Java.loadClass('net.minecraftforge.energy.IEnergyStorage')
    let IItemHandler = Java.loadClass('net.minecraftforge.items.IItemHandler')
    let IFluidHandler = Java.loadClass('net.minecraftforge.fluids.capability.IFluidHandler')
    let {
        ENERGY: FECap,
        ITEM_HANDLER: ItemCap,
        FLUID_HANDLER: FluidCap,
    } = Java.loadClass('net.minecraftforge.common.capabilities.ForgeCapabilities')
    let SEHelper = Java.loadClass('com.Polarice3.Goety.utils.SEHelper')
    let MainConfig = Java.loadClass('com.Polarice3.Goety.config.MainConfig')
    let LazyOptional = Java.loadClass('net.minecraftforge.common.util.LazyOptional')

    let protoSoul = {
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
    }

    let RATE = 200
    let RATE_EXTRACT_LOSS = 0.1
    /**@type {Internal.IEnergyStorage & {arca:Internal.ArcaBlockEntity}}*/
    let protoFE = {
        __proto__: protoSoul,

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

    let protoFluid = null
    if (Platform.isLoaded('create_enchantment_industry')) {
        let FluidStack = Java.loadClass('net.minecraftforge.fluids.FluidStack')
        let CeiFluids = Java.loadClass('plus.dragons.createenchantmentindustry.entry.CeiFluids')
        let RATE_EXP = 1

        /**@type {Internal.IFluidHandler & {arca:Internal.ArcaBlockEntity}}*/
        protoFluid = {
            __proto__: protoSoul,

            getTanks() {
                return 1
            },
            getFluidInTank(tank) {
                // if (tank > 0) return FluidStack.EMPTY
                return new FluidStack(CeiFluids.HYPER_EXPERIENCE.get(), RATE_EXP * this.getSoul(), { foo: 'bar' })
            },
            getTankCapacity(tank) {
                return RATE_EXP * this.getMaxSoul()
            },
            isFluidValid(tank, stack) {
                return true
            },
            fill(resource, action) {
                return 0
            },
            drain(resource, action) {
                if (resource.amount) resource = resource.amount
                let oldSoul = this.getSoul()
                let soulDrained = Math.min(resource / RATE_EXP, oldSoul)
                let fluidDrained = soulDrained * RATE_EXP
                if (action == 'EXECUTE') {
                    this.setSoul(oldSoul - soulDrained)
                } 
                return fluidDrained
            },
        }
    }

    let doArcaInject = (/**@type {Internal.AttachCapabilitiesEvent<Internal.BlockEntity>}*/ event) => {
        let be = event.getObject()
        try {
            if (!(be instanceof ArcaBlockEntity)) return
            event.addCapability('kubejs:arca', (cap, side) => {
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
                else if (protoFluid && cap == FluidCap)
                    return LazyOptional.of(
                        () =>
                            new JavaAdapter(IFluidHandler, {
                                arca: be,
                                __proto__: protoFluid,
                            }),
                    )
                return LazyOptional.empty()
            })
        } catch (e) {
            if (Utils.server) Utils.server.tell(e)
        }
    }

    // load event
    let [clsEvent, clsType] = ['net.minecraftforge.event.AttachCapabilitiesEvent', 'net.minecraft.world.level.block.entity.BlockEntity']
    if (Platform.isLoaded('eventjs')) {
        // https://github.com/ZZZank/EventJS/issues/1
        if (Platform.getInfo('eventjs').version < '1.4.1') [clsEvent, clsType] = [clsType, clsEvent]
        ForgeEvents.onGenericEvent(clsEvent, clsType, doArcaInject)
    } else {
        global.doArcaInject = doArcaInject
        ForgeEvents.onGenericEvent(clsEvent, clsType, e => global.doArcaInject(e))
    }
}
