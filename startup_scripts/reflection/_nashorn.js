// ignore:true

var F_SM_CF = Java.type('dev.latvian.mods.kubejs.script.ScriptManager').class.getDeclaredField('classFilter')
F_SM_CF.setAccessible(true)
var CF = Java.type('dev.latvian.mods.kubejs.plugin.ClassFilter')
CF = new CF(null)

function unlock(sm) {
    F_SM_CF.set(sm, CF)
}

function unlockServer(server) {
    unlock(server.getServerResources().managers().kjs$getServerScriptManager())
    throw 'test'
}

// eval after init
var KJS = Java.type('dev.latvian.mods.kubejs.KubeJS')
unlock(KJS.startupScriptManager)
unlock(KJS.clientScriptManager)
