{
    let ammoSwapMap = {
        // BFG!
        slime_block: {
            Gun: {
                General: { ProjectileAmount: 1, Spread: 0 },
                Projectile: { Item: 'slime_block', Speed: 0.5, Life: 40 },
            },
            display: { Name: '{"text":"BFG 114514"}' },
        },
    }
    let ammoSwapNameMap = {
        slime_block: Text.red('BFG 114514'),
    }

    ServerEvents.recipes(e => {
        function pickGun(grid) {
            let total = grid.width * grid.height
            let gunStack = null
            for (let i = 0; i < total; i++) {
                gunStack = grid.get(i)
                if (gunStack.idLocation.namespace == 'scguns') break
            }
            if (!gunStack.item.getModifiedGun) return
            return gunStack
        }

        function setAmmoSwap(ammo, recipe) {
            recipe = recipe || ammo

            e.shapeless('barrier', [recipe, Ingredient.of('@scguns')]).modifyResult(grid => {
                let gunStack = pickGun(grid)
                if (!gunStack || gunStack.orCreateTag.Gun?.Projectile?.Item == ammo) return

                gunStack.nbt.merge(ammoSwapMap[ammo])
                gunStack.setHoverName(ammoSwapNameMap[ammo])
                return gunStack
            })
        }

        // alt ammo
        setAmmoSwap('slime_block')

        // recover default ammo
        e.shapeless('barrier', ['paper', Ingredient.of('@scguns')]).modifyResult(grid => {
            let gunStack = pickGun(grid)
            if (!gunStack.nbt?.Gun) return
            delete gunStack.nbt.Gun
            delete gunStack.nbt.display
            return gunStack
        })
    })
}
