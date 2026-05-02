// ignored: true
// because: https://discord.com/channels/303440391124942858/303440391124942858/1278759803879166076
{
    let BLOCK_ID = 'yc:menger_sponge'

    let IItemHandler = Java.loadClass('net.neoforged.neoforge.items.IItemHandler')
    let {
        ItemHandler: { BLOCK: ItemCap },
    } = Java.loadClass('net.neoforged.neoforge.capabilities.Capabilities')

    StartupEvents.registry('block', e => {
        e.create(BLOCK_ID)
            .blockEntity(beInfo => {
                beInfo.inventory(1, 1) // damn
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

    let doSpongeInject = (/**@type {Internal.RegisterCapabilitiesEvent}*/ event) => {
        try {
            e.registerBlockEntity(ItemCap, BLOCK_ID, (be, side) => {
                return new JavaAdapter(IItemHandler, {
                    inv: be.inventory,
                    __proto__: protoItem,
                })
            })
        } catch (e) {
            if (global.server) global.server.tell(e)
        }
    }

    NativeEvents.onEvent('net.neoforged.neoforge.capabilities.RegisterCapabilitiesEvent', doSpongeInject)
}
