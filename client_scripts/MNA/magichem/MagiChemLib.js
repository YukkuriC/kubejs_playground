// requires: magichem
let MagiChemLib = {}
{
    let SMALL_NUMS = ['\u2080', '\u2081', '\u2082', '\u2083', '\u2084', '\u2085', '\u2086', '\u2087', '\u2088', '\u2089']
    let toSmallNum = (MagiChemLib.toSmallNum = num => {
        if (num < 10) return SMALL_NUMS[num]
        return toSmallNum(Math.floor(num / 10)) + SMALL_NUMS[num % 10]
    })
}
