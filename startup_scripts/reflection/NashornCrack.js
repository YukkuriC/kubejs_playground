const Nashorn = Java.loadClass('javax.script.ScriptEngineManager')().getEngineByName('nashorn')

Nashorn.eval(`
var F_SM_CF = Java.type('dev.latvian.mods.kubejs.script.ScriptManager').class.getDeclaredField('classFilter')
F_SM_CF.setAccessible(true)
var CF = Java.type('dev.latvian.mods.kubejs.plugin.ClassFilter')
var cf = new CF(null)

function unlock(sm) {
    F_SM_CF.set(sm, cf)
}

function unlockServer(server) {
    unlock(server.getServerResources().managers().kjs$getServerScriptManager())
}
`)

global.Nashorn = Nashorn

StartupEvents.init(() => {
    Nashorn.eval(`
var KJS = Java.type('dev.latvian.mods.kubejs.KubeJS')
unlock(KJS.startupScriptManager)
unlock(KJS.clientScriptManager)
    `)
})
