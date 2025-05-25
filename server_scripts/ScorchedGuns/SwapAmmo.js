{
    let ammoSwapMap = {
        // BFG!
        slime_block: {
            Gun: {
                General: { ProjectileAmount: 1, Spread: 0 },
                Projectile: { Item: 'slime_block', Speed: 0.5, Life: 40, EjectsCasing: false },
            },
            display: { Name: '{"text":"BFG 114514"}' },
        },
    }
    let ammoSwapNameMap = {
        slime_block: Text.red('BFG 114514'),
    }

    let modifyGun = (gun, ammo) => {
        gun.orCreateTag.merge(ammoSwapMap[ammo])
        gun.setHoverName(ammoSwapNameMap[ammo])
    }

    ServerEvents.recipes(e => {
        let targetGuns = Ingredient.of('@scguns').itemIds.filter(x => !!Item.of(x).item.getModifiedGun)

        function pickGun(grid) {
            let total = grid.width * grid.height
            let gunStack = null
            for (let i = 0; i < total; i++) {
                gunStack = grid.get(i)
                if (gunStack.item.getModifiedGun) break
            }
            return gunStack
        }

        function setAmmoSwap(ammo, recipe) {
            recipe = recipe || ammo

            for (let gun of targetGuns) {
                let modified = Item.of(gun)
                modifyGun(modified, ammo)
                e.shapeless(modified, [recipe, gun])
                    .modifyResult(grid => {
                        let gunStack = pickGun(grid)
                        if (!gunStack || gunStack.orCreateTag.Gun?.Projectile?.Item == ammo) return
                        modifyGun(gunStack, ammo)
                        return gunStack
                    })
                    .id(`yc:gunswap_${gun.split(':')[1]}_${ammo}`)
            }
        }

        // alt ammo
        setAmmoSwap('slime_block')

        // recover default ammo
        for (let gun of targetGuns) {
            e.shapeless(gun, ['paper', gun])
                .modifyResult(grid => {
                    let gunStack = pickGun(grid)
                    if (!gunStack.nbt?.Gun) return
                    delete gunStack.nbt.Gun
                    delete gunStack.nbt.display
                    return gunStack
                })
                .id(`yc:gunswap_${gun.split(':')[1]}_recover`)
        }
    })
}
