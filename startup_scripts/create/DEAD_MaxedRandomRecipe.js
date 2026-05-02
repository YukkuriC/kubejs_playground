// requires: create
// requires: unsafejs
// ignored: true
// because create 1.21 uses level RNG for recipe outputs
{
    let Random = Java.loadClass('java.util.Random')
    let ProcessingOutput = Java.loadClass('com.simibubi.create.content.processing.recipe.ProcessingOutput')

    Unsafe.setField(
        ProcessingOutput,
        'r',
        new JavaAdapter(Random, {
            nextFloat() {
                return 0
            },
        }),
    )
}
