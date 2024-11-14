{
    let PE = Client.particleEngine
    let TwoPI = KMath.PI * 2

    ClientEvents.loggedIn(e => {
        PE = Client.particleEngine
    })

    let ParticlesCls = function () {
        // helpers
        {
            // vec <-> list
            this.vec2list = vec => [vec.x(), vec.y(), vec.z()]
            this.list2vec = list => new Vec3d(list[0], list[1], list[2])

            // get axes from vector
            this.getAxes = function (x, y, z) {
                let lx, ly
                if (x == 0 && z == 0) {
                    lx = Vec3d(y, 0, 0)
                    ly = Vec3d(0, 0, y)
                } else {
                    let len = Math.sqrt(x * x + z * z)
                    lx = Vec3d(
                        // y=0的垂直单位向量
                        z / len,
                        0,
                        -x / len,
                    )
                    ly = Vec3d(x, y, z).cross(lx)
                }
                return [lx, ly]
            }

            // spawner
            this.getSpawner = type => (x, y, z) => PE.createParticle(type, x, y, z, 0, 0, 0)
            this.wrapSpawner = function (spawner) {
                if (typeof spawner === 'string') return this.getSpawner(spawner)
                return spawner
            }
        }

        // axes functions
        {
            // circle
            this.circle = function (spawner, center, axes, radius, n, offset) {
                spawner = this.wrapSpawner(spawner)
                if (offset === undefined) offset = TwoPI * Math.random()
                let [lx, ly] = axes
                for (let i = 0; i < n; i++) {
                    let angle = (TwoPI * i + offset) / n
                    let target = center.add(lx.scale(Math.cos(angle) * radius)).add(ly.scale(Math.sin(angle) * radius))
                    spawner(target.x(), target.y(), target.z())
                }
            }

            // star
            this.star = function (spawner, center, axes, radius, n, nstep, offset, sep) {
                spawner = this.wrapSpawner(spawner)
                if (offset === undefined) offset = TwoPI * Math.random()
                if (sep === undefined) sep = 30
                nstep = Math.abs(nstep)
                let [x, y] = axes

                let nodes = []
                for (let i = 0; i < n; i++) {
                    let angle = (TwoPI * i + offset) / n
                    nodes.push(center.add(x.scale(radius * Math.cos(angle))).add(y.scale(radius * Math.sin(angle))))
                }
                for (let i = 0; i < n; i++) {
                    let p1 = nodes[i]
                    let p2 = nodes[(i + nstep) % n]
                    for (let j = 0; j < sep; j++) {
                        let ratio = j / sep
                        let pt = p1.scale(ratio).add(p2.scale(1 - ratio))
                        spawner.apply(this, this.vec2list(pt))
                    }
                }
            }
        }

        // line functions
        {
            // lightning
            let _lightning = (spawner, x1, y1, z1, x2, y2, z2) => {
                spawner(x1, y1, z1)
                let dx = Math.abs(x1 - x2),
                    dy = Math.abs(y1 - y2),
                    dz = Math.abs(z1 - z2),
                    delta = (dx + dy + dz) / 3
                if (delta > 0.1) {
                    let nx = (x1 + x2) / 2 + (Math.random() - 0.5) * delta * 0.7,
                        ny = (y1 + y2) / 2 + (Math.random() - 0.5) * delta * 0.7,
                        nz = (z1 + z2) / 2 + (Math.random() - 0.5) * delta * 0.7
                    _lightning(spawner, x1, y1, z1, nx, ny, nz)
                    _lightning(spawner, nx, ny, nz, x2, y2, z2)
                }
            }
            this.lightning = function (spawner, posArr1, posArr2) {
                spawner = this.wrapSpawner(spawner)
                _lightning(spawner, posArr1[0], posArr1[1], posArr1[2], posArr2[0], posArr2[1], posArr2[2])
            }
        }
    }

    global.setter.Particles = new ParticlesCls()
}
