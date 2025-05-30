// requires: villagercomfort
{
    // batch import
    // search: import (.+\.(.+));
    // replace: $2: Java.loadClass('$1'),
    let VillagerComfort = Java.loadClass('dev.ghen.villagercomfort.VillagerComfort')
    let IComfortValuesCap = Java.loadClass('dev.ghen.villagercomfort.common.capabilty.IComfortValuesCap')
    let ModCapabilities = Java.loadClass('dev.ghen.villagercomfort.common.capabilty.ModCapabilities')
    let CommonConfig = Java.loadClass('dev.ghen.villagercomfort.core.config.CommonConfig')
    let MathHelper = Java.loadClass('dev.ghen.villagercomfort.core.math.MathHelper')
    let MemoryModuleType = Java.loadClass('net.minecraft.world.entity.ai.memory.MemoryModuleType')
    let Villager = Java.loadClass('net.minecraft.world.entity.npc.Villager')

    // do comfort check
    // https://gitlab.com/leahx_y2k/villager-comfort-updated/-/blob/main/src/main/java/dev/ghen/villagercomfort/comfort/ComfortHelper.java
    let checkComfort = (/**@type {Internal.Villager}*/ villager, checker) => {
        if (villager.type != 'minecraft:villager')
            return checker.tell(Text.translate('villagercomfort.ext.error.invalid', villager.name).gold())

        let comfort = 0
        let addComfortChange = (reason, delta) => {
            let oldComfort = comfort,
                newComfort = comfort + delta
            let msg = Text.translate(
                'villagercomfort.ext.formula',
                Text.translate(`villagercomfort.ext.target.${reason}`),
                oldComfort,
                delta >= 0 ? '+' : '-',
                Math.abs(delta),
                newComfort,
            )
            if (delta > 0) msg = msg.green()
            else if (delta < 0) msg = msg.red()
            checker.tell(msg)
            comfort += delta
        }

        // use imports
        let cap = villager.getCapability(ModCapabilities.COMFORT_VALUES_CAP).orElse(null)
        if (!cap) return checker.tell(Text.translate('villagercomfort.ext.error.missing_cap').gold())

        // title
        let header = Text.translate('villagercomfort.ext.header', villager.name)
        checker.tell(header)

        //bedroom related
        if (cap.hasBed()) {
            // bedroom size
            if (cap.getBedroomSize() >= CommonConfig.MAX_BEDROOM_SIZE.get().intValue()) {
                addComfortChange('BEDROOM_SIZE', CommonConfig.MAX_BEDROOM_SIZE_COMFORT.get().intValue())
            } else if (cap.getBedroomSize() > CommonConfig.AVERAGE_BEDROOM_SIZE.get().intValue()) {
                addComfortChange(
                    'BEDROOM_SIZE',
                    MathHelper.scale(
                        cap.getBedroomSize() - CommonConfig.AVERAGE_BEDROOM_SIZE.get().intValue(),
                        CommonConfig.MAX_BEDROOM_SIZE.get().intValue() - CommonConfig.AVERAGE_BEDROOM_SIZE.get().intValue(),
                        CommonConfig.MAX_BEDROOM_SIZE_COMFORT.get().intValue(),
                    ),
                )
            } else if (cap.getBedroomSize() < CommonConfig.AVERAGE_BEDROOM_SIZE.get().intValue()) {
                addComfortChange(
                    'BEDROOM_SIZE',
                    MathHelper.scale(
                        CommonConfig.AVERAGE_BEDROOM_SIZE.get().intValue() - cap.getBedroomSize(),
                        CommonConfig.AVERAGE_BEDROOM_SIZE.get().intValue(),
                        CommonConfig.MIN_BEDROOM_SIZE_COMFORT.get().intValue(),
                    ),
                )
            }

            //beds
            if (cap.getBedsCount() > CommonConfig.BEDS_THRESHOLD.get().intValue())
                addComfortChange(
                    'BED_COUNT',
                    (cap.getBedsCount() - CommonConfig.BEDS_THRESHOLD.get().intValue()) * CommonConfig.COMFORT_PER_BED.get().intValue(),
                )

            //bedroom light
            if (cap.getBedroomLight() > CommonConfig.BEDROOM_LIGHT_AVERAGE.get().intValue()) {
                addComfortChange(
                    'BEDROOM_LIGHT',
                    (cap.getBedroomLight() - CommonConfig.BEDROOM_LIGHT_AVERAGE.get().intValue()) *
                        CommonConfig.COMFORT_PER_MORE_BEDROOM_LIGHT.get().intValue(),
                )
            } else if (cap.getBedroomLight() < CommonConfig.BEDROOM_LIGHT_AVERAGE.get().intValue()) {
                addComfortChange(
                    'BEDROOM_LIGHT',
                    (CommonConfig.BEDROOM_LIGHT_AVERAGE.get().intValue() - cap.getBedroomLight()) *
                        CommonConfig.COMFORT_PER_LESS_BEDROOM_LIGHT.get().intValue(),
                )
            }

            //workstation in bedroom
            if (cap.getIsWorkstationInBedroom())
                addComfortChange('WORKSTATION_IN_BEDROOM', CommonConfig.WORKSTATION_IN_BEDROOM_COMFORT.get().intValue())
        }

        //workplace related
        if (cap.hasWorkplace()) {
            // workplace size
            if (cap.getWorkplaceSize() >= CommonConfig.MAX_WORKPLACE_SIZE.get().intValue()) {
                addComfortChange('WORKPLACE_SIZE', CommonConfig.MAX_WORKPLACE_SIZE_COMFORT.get().intValue())
            } else if (cap.getWorkplaceSize() > CommonConfig.AVERAGE_WORKPLACE_SIZE.get().intValue()) {
                addComfortChange(
                    'WORKPLACE_SIZE',
                    MathHelper.scale(
                        cap.getWorkplaceSize() - CommonConfig.AVERAGE_WORKPLACE_SIZE.get().intValue(),
                        CommonConfig.MAX_WORKPLACE_SIZE.get().intValue() - CommonConfig.AVERAGE_WORKPLACE_SIZE.get().intValue(),
                        CommonConfig.MAX_WORKPLACE_SIZE_COMFORT.get().intValue(),
                    ),
                )
            } else if (cap.getWorkplaceSize() < CommonConfig.AVERAGE_WORKPLACE_SIZE.get().intValue()) {
                addComfortChange(
                    'WORKPLACE_SIZE',
                    MathHelper.scale(
                        CommonConfig.AVERAGE_WORKPLACE_SIZE.get().intValue() - cap.getWorkplaceSize(),
                        CommonConfig.AVERAGE_WORKPLACE_SIZE.get().intValue(),
                        CommonConfig.MIN_WORKPLACE_SIZE_COMFORT.get().intValue(),
                    ),
                )
            }

            //workstations
            if (cap.getWorkstationsCount() > CommonConfig.WORKSTATIONS_THRESHOLD.get().intValue())
                addComfortChange(
                    'WORKSTATION_COUNT',
                    (cap.getWorkstationsCount() - CommonConfig.WORKSTATIONS_THRESHOLD.get().intValue()) *
                        CommonConfig.COMFORT_PER_WORKSTATION.get().intValue(),
                )

            //workplace light
            if (cap.getWorkplaceLight() > CommonConfig.WORKPLACE_LIGHT_AVERAGE.get().intValue()) {
                addComfortChange(
                    'WORKPLACE_LIGHT',
                    (cap.getWorkplaceLight() - CommonConfig.WORKPLACE_LIGHT_AVERAGE.get().intValue()) *
                        CommonConfig.COMFORT_PER_MORE_WORKPLACE_LIGHT.get().intValue(),
                )
            } else if (cap.getWorkplaceLight() < CommonConfig.WORKPLACE_LIGHT_AVERAGE.get().intValue()) {
                addComfortChange(
                    'WORKPLACE_LIGHT',
                    (CommonConfig.WORKPLACE_LIGHT_AVERAGE.get().intValue() - cap.getWorkplaceLight()) *
                        CommonConfig.COMFORT_PER_LESS_WORKPLACE_LIGHT.get().intValue(),
                )
            }
        }

        // distance between a villager's bed and their workplace
        if (cap.hasBed() && cap.hasWorkplace()) {
            if (cap.getBedWorkstationDistance() > CommonConfig.MAX_BED_WORKPLACE_DISTANCE.get().intValue()) {
                addComfortChange(
                    'WORK_DISTANCE',
                    CommonConfig.MAX_BED_WORKPLACE_DISTANCE.get().intValue() -
                        CommonConfig.AVERAGE_DISTANCE_BED_WORKPLACE.get().intValue() *
                            CommonConfig.COMFORT_PER_MORE_BED_WORKPLACE_DISTANCE.get().intValue(),
                )
            } else if (cap.getBedWorkstationDistance() > CommonConfig.AVERAGE_DISTANCE_BED_WORKPLACE.get().intValue()) {
                addComfortChange(
                    'WORK_DISTANCE',
                    cap.getBedWorkstationDistance() -
                        CommonConfig.AVERAGE_DISTANCE_BED_WORKPLACE.get().intValue() *
                            CommonConfig.COMFORT_PER_MORE_BED_WORKPLACE_DISTANCE.get().intValue(),
                )
            } else if (cap.getBedWorkstationDistance() < CommonConfig.AVERAGE_DISTANCE_BED_WORKPLACE.get().intValue()) {
                addComfortChange(
                    'WORK_DISTANCE',
                    CommonConfig.AVERAGE_DISTANCE_BED_WORKPLACE.get().intValue() -
                        cap.getBedWorkstationDistance() * CommonConfig.COMFORT_PER_LESS_BED_WORKPLACE_DISTANCE.get().intValue(),
                )
            }
        }

        // time spent outside
        if (cap.getDaysWithoutOutside() > 0)
            addComfortChange('DAYS_OUTSIDE', cap.getDaysWithoutOutside() * CommonConfig.COMFORT_PER_DAY_WITHOUT_OUTSIDE.get().intValue())

        // days without zombie attacks
        if (cap.getDaysWithoutZombie() > CommonConfig.MAX_DAYS_WITHOUT_ZOMBIE.get().intValue())
            addComfortChange(
                'DAYS_WITHOUT_ZOMBIE',
                CommonConfig.MAX_DAYS_WITHOUT_ZOMBIE.get().intValue() * CommonConfig.COMFORT_PER_DAY_WITHOUT_ZOMBIE.get().intValue(),
            )
        else if (cap.getDaysWithoutZombie() > 0)
            addComfortChange(
                'DAYS_WITHOUT_ZOMBIE',
                cap.getDaysWithoutZombie() * CommonConfig.COMFORT_PER_DAY_WITHOUT_ZOMBIE.get().intValue(),
            )

        // days without sleeping (glitched)
        // if (villager.getBrain().getMemory(MemoryModuleType.LAST_SLEPT).orElse(0) > 24000)
        //     addComfortChange(
        //         'DAYS_WITHOUT_SLEEP',
        //         (villager.getBrain().getMemory(MemoryModuleType.LAST_SLEPT).orElse(0) / 24000) *
        //             CommonConfig.COMFORT_PER_DAY_WITHOUT_SLEEP.get().intValue(),
        //     )

        comfort = Math.min(100, Math.max(-100, comfort))

        checker.tell(Text.translate('villagercomfort.ext.summary', comfort).yellow())
        villager.potionEffects.add('glowing', 10)
    }

    // TODO 换成专门道具
    ItemEvents.rightClicked('poppy', e => {
        let { player } = e
        let { entity } = player.rayTrace(32, false)
        checkComfort(entity, player)
    })
}
