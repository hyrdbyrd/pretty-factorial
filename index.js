const LINES = {
    topToBottom: 'topToBottom',
    bottomToTop: 'bottomToTop',
    empty: 'empty'
};

const X_SIDES = {
    left: 'left',
    right: 'right'
}

const Y_SIDES = {
    top: 'top',
    bottom: 'bottom'
}

const hashmapRotate = obj => Object.entries(obj).reduce((acc, [key, value]) => (acc[value] = key, acc), {});

function createPool(canvas, size = 7) {
    const ctx = canvas.getContext('2d');
    const SIZE = size;

    let width, height;

    width = canvas.width | 0;
    height = canvas.height | 0;

    while (width % SIZE !== 0) width--;
    while (height % SIZE !== 0) height--;

    canvas.width = width;
    canvas.height = height;

    canvas.onresize = createPool.bind(null, canvas);

    const mHeight = height / SIZE | 0;
    const mWidth = width / SIZE | 0;

    const matrix = new Array(mHeight).fill(0).map(() => new Array(mWidth).fill(LINES.empty));

    const clear = () => ctx.clearRect(0, 0, width, height);

    const drawEdges = () => {
        ctx.strokeStyle = '#99f';
        for (const [y, row] of Object.entries(matrix))
            for (const [x] of Object.entries(row))
                ctx.strokeRect(x * SIZE, y * SIZE, SIZE, SIZE);
    }

    const drawLines = () => {
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#000';
        for (const [y, row] of Object.entries(matrix))
            for (const [x, cell] of Object.entries(row)) {
                ctx.beginPath();

                switch (cell) {
                    case LINES.topToBottom:
                        ctx.moveTo(x * SIZE, y * SIZE);
                        ctx.lineTo(x * SIZE + SIZE, y * SIZE + SIZE);
                        break;

                    case LINES.bottomToTop:
                        ctx.moveTo(x * SIZE, y * SIZE + SIZE);
                        ctx.lineTo(x  * SIZE + SIZE, y * SIZE);
                        break;

                    default:
                }

                ctx.stroke();
                ctx.closePath()
            }
    }

    const draw = () => {
        clear();
        // drawEdges();
        drawLines();
    };

    let x = 0,
        y = 0;

    let vx = X_SIDES.right;
    let vy = Y_SIDES.bottom;

    const getLineBySides = () => {
        if (
            vy === Y_SIDES.top && vx === X_SIDES.left ||
            vy === Y_SIDES.bottom && vx === X_SIDES.right
        ) return LINES.topToBottom;
        if (
            vy === Y_SIDES.top && vx === X_SIDES.right ||
            vy === Y_SIDES.bottom && vx === X_SIDES.left
        ) return LINES.bottomToTop;
        return LINES.empty;
    }

    const xDirsMapper = {
        [X_SIDES.right]: 1,
        [X_SIDES.left]: -1
    };

    const yDirsMapper = {
        [Y_SIDES.top]: -1,
        [Y_SIDES.bottom]: 1
    };

    const xVectorsMapper = hashmapRotate(xDirsMapper)
    const yVectorsMapper = hashmapRotate(yDirsMapper);

    const nextVectors = (nextCall = false) => {
        let dx = xDirsMapper[vx];
        let dy = yDirsMapper[vy];

        if (
            y + dy === -1 && x + dx === -1 ||
            x + dy === -1 && y + dy === mHeight ||
            x + dx === mWidth && y + dy === mHeight ||
            x + dx === mWidth && y + dy === -1
        ) return false;

        if (matrix[y + dy] === undefined) {
            vy = yVectorsMapper[dy * -1];

            if (matrix[y][x + dx] === undefined) return false;
            x += dx;

            return nextVectors(true)
        } else if (matrix[y + dy][x + dx] === undefined) {
            vx = xVectorsMapper[dx * -1];

            if (matrix[y + dy] === undefined) return false;
            y += dy;

            return nextVectors(true);
        } else if (!nextCall) {
            x += dx;
            y += dy;
        }

        return true;
    }


    let i = 0;
    while (true) {
        if (i++ % 2 === 0)
            matrix[y][x] = getLineBySides();

        if (!nextVectors()) {
            draw();
            break;
        }
    }
}


const canvas = document.querySelector('#canvas');
const pool = document.querySelector('#pool');
const input = document.querySelector('#size');

let size = 7;
let fixed = false;

createPool(canvas, size);

pool.addEventListener('click', () => {
    fixed = !fixed;
    pool.classList[fixed ? 'add' : 'remove']('fixed');
});

pool.addEventListener('mousemove', event => {
    if (fixed) return;

    canvas.width = event.x;
    canvas.height = event.y;

    createPool(canvas, size);
});

input.addEventListener('input', event => {
    const val = parseInt(event.target.value);

    if (isNaN(val)) return;
    createPool(canvas, val);
    size = val;
});
