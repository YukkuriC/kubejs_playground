NetworkEvents.dataReceived('hexParse/clipboard/pull', e => {
    let clipboard = String(Client.keyboardHandler.clipboard)
    if (clipboard && clipboard.length > 0) {
        Client.player.sendData('hexParse/clipboard/push', {
            code: clipboard,
            rename: e.data.rename,
        })
    }
})
