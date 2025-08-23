{
    let BLOCK_ID = 'yc:menger_sponge'

    let IItemHandler = Java.loadClass('net.minecraftforge.items.IItemHandler')
    let { ITEM_HANDLER: ItemCap } = Java.loadClass('net.minecraftforge.common.capabilities.ForgeCapabilities')
    let LazyOptional = Java.loadClass('net.minecraftforge.common.util.LazyOptional')

    StartupEvents.registry('block', e => {
        e.create(BLOCK_ID)
            .blockEntity(beInfo => {
                beInfo.inventory(1, 1)
            })
            .opaque(false)
            .resistance(114514)
            .displayName('Menger Sponge')
            .defaultCutout()
            .bounciness(0.2)
    })

    /**@type {Internal.IItemHandler & {inv:Internal.InventoryKJS}}*/
    let protoItem = {
        getSlots() {
            return this.inv.slots
        },
        getStackInSlot(slot) {
            return this.inv.getStackInSlot(slot)
        },
        insertItem(slot, stack, simulate) {
            if (slot != 0 || !this.inv.getStackInSlot(0).empty) return stack
            if (!simulate) this.inv.setStackInSlot(0, stack.copyWithCount(stack.count * 3))
            return Item.empty
        },
        extractItem(slot, amount, simulate) {
            return this.inv.extractItem(slot, amount, simulate)
        },
        getSlotLimit(slot) {
            return slot > 0 ? 0 : 114514
        },
        isItemValid(slot, stack) {
            return slot == 0
        },
    }

    let doSpongeInject = (/**@type {Internal.AttachCapabilitiesEvent<Internal.BlockEntity>}*/ event) => {
        let be = event.getObject()
        try {
            if (be.blockState.block.id != BLOCK_ID) return
            event.addCapability('yc:sponge_duper', (cap, side) => {
                if (cap == ItemCap)
                    return LazyOptional.of(
                        () =>
                            new JavaAdapter(IItemHandler, {
                                inv: be.inventory,
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
    let [clsEvent, clsType] = ['net.minecraftforge.event.AttachCapabilitiesEvent', 'net.minecraft.world.level.block.entity.BlockEntity']
    if (Platform.isLoaded('eventjs')) {
        // https://github.com/ZZZank/EventJS/issues/1
        if (Platform.getInfo('eventjs').version < '1.4.1') [clsEvent, clsType] = [clsType, clsEvent]
        ForgeEvents.onGenericEvent(clsEvent, clsType, doSpongeInject)
    } else {
        global.doSpongeInject = doSpongeInject
        ForgeEvents.onGenericEvent(clsEvent, clsType, e => global.doSpongeInject(e))
    }
}
