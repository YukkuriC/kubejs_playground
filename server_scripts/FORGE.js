const Integer = Java.loadClass('java.lang.Integer')

global.setter.SERVER_SCOPE = this

let server = null
{
    let setServer = e => {
        server = global.setter.server = e.server
    }
    ServerEvents.loaded(setServer)
    ServerEvents.command('reload', setServer)
}
