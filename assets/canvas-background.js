/**
 THIS FILE CONTAINS ES6+ AND WILL NOT RUN ON OLD BROWSERS.
 PLEASE COMPILE USING BABEL (https://babeljs.io/repl)
 THEN MOVE THE MINIFIED VERSION INTO theme.min.js
 */
class CanvasAnimation {
    constructor(container, hue = 400, maxStars = 100) {
        this.$canvas = container;
        this.ctx = this.$canvas.getContext('2d');
        this.w = this.$canvas.width = window.innerWidth;
        this.h = this.$canvas.height = window.innerHeight;
        this.hue = hue;
        this.stars = [];
        this.count = 0;
        this.maxStars = maxStars;

        this.animation = this.animation.bind(this);

        this.init();
    }

    init () {
        this.$canvas2 = document.createElement('canvas');
        this.ctx2 = this.$canvas2.getContext('2d');
        this.$canvas2.width = 100;
        this.$canvas2.height = 100;
        this.half = this.$canvas2.width / 2;

        this.gradient2 = this.ctx2.createRadialGradient(this.half, this.half, 0, this.half, this.half, this.half);
        this.gradient2.addColorStop(0.025, '#fff');
        this.gradient2.addColorStop(0.1, 'hsl(' + this.hue + ', 91%, 83%)');
        this.gradient2.addColorStop(0.25, 'hsl(' + this.hue + ', 64%, 26%)');
        this.gradient2.addColorStop(1, 'transparent');

        this.ctx2.fillStyle = this.gradient2;
        this.ctx2.beginPath();
        this.ctx2.arc(this.half, this.half, this.half, 0, Math.PI * 2);
        this.ctx2.fill();

        for (var i=0;i<this.maxStars;i++) {
            this.count++;
            this.stars[this.count] = new Star({
                random: this.random,
                maxOrbit: this.maxOrbit,
                w: this.w,
                h: this.h,
                maxStars: this.maxStars,
                ctx: this.ctx,
                canvas2: this.$canvas2
            });
        }

        this.animation();
    }

    random (min, max) {
        if (arguments.length < 2) {
            max = min;
            min = 0;
        }

        if (min > max) {
            var hold = max;
            max = min;
            min = hold;
        }

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    maxOrbit (x, y) {
        var max = Math.max(x,y);
        var diameter = Math.round(Math.sqrt(max*max + max*max));
        return diameter/2;
    }

    animation () {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = 'hsla(' + this.hue + ', 0%, 13%, 1)';
        this.ctx.fillRect(0, 0, this.w, this.h)

        this.ctx.globalCompositeOperation = 'lighter';
        for (var i = 1, l = this.stars.length; i < l; i++) {
            this.stars[i].draw();
        }

        window.requestAnimationFrame(this.animation);
    }
}


class Star {
    constructor({ random, maxOrbit, w, h, maxStars, ctx, canvas2 }) {
        this.random = random;
        this.maxOrbit = maxOrbit;
        this.w = w;
        this.h = h;
        this.maxStars = maxStars;
        this.ctx = ctx;
        this.$canvas2 = canvas2;

        this.draw = this.draw.bind(this);

        this.init();
    }

    init () {
        this.orbitRadius = this.random(this.maxOrbit(this.w, this.h));
        this.radius = this.random(60, this.orbitRadius) / 12;
        this.orbitX = this.w / 2;
        this.orbitY = this.h / 2;
        this.timePassed = this.random(0, this.maxStars);
        this.speed = this.random(this.orbitRadius) / 900000;
        this.alpha = this.random(2, 10) / 10;
    }

    draw () {
        var x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
        var y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
        var twinkle = this.random(10);

        if (twinkle === 1 && this.alpha > 0) {
            this.alpha -= 0.05;
        } else if (twinkle === 2 && this.alpha < 1) {
            this.alpha += 0.05;
        }

        this.ctx.globalAlpha = this.alpha;
        this.ctx.drawImage(this.$canvas2, x - this.radius / 2, y - this.radius / 2, this.radius, this.radius);
        this.timePassed += this.speed;
    }
}

(function () {
    var canvases = document.querySelectorAll('.canvas-animated-bg');
    canvases.forEach(function (el) { new CanvasAnimation(el) });
})();
/**
 THIS FILE CONTAINS ES6+ AND WILL NOT RUN ON OLD BROWSERS.
 PLEASE COMPILE USING BABEL (https://babeljs.io/repl)
 THEN MOVE THE MINIFIED VERSION INTO theme.min.js
 */
