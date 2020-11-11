/***************************** INITIAL SETUP **************************/

// Hard-code planets.txt into your program (yeah it's lazy but whatever)
let universes = {
    planets: `
        5
        2.50e+11
        1.4960e+11  0.0000e+00  0.0000e+00  2.9800e+04  5.9740e+24    earth.gif
        2.2790e+11  0.0000e+00  0.0000e+00  2.4100e+04  6.4190e+23     mars.gif
        5.7900e+10  0.0000e+00  0.0000e+00  4.7900e+04  3.3020e+23  mercury.gif
        0.0000e+00  0.0000e+00  0.0000e+00  0.0000e+00  1.9890e+30      sun.gif
        1.0820e+11  0.0000e+00  0.0000e+00  3.5000e+04  4.8690e+24    venus.gif`
};

// Parse planets.txt into an array of strings.
// This will help us emulate Princeton's StdIn.java functionality
let universeStrSplit = universes.planets.match(/\S+/g);

// Set delta-T for our NBody simulation
let dt = 25000.0;

// Initialize vars to store info parsed from universeStrSplit
let n = parseInt(universeStrSplit[0]);          // number of bodies in universe
let radius = parseFloat(universeStrSplit[1]);   // radius of universe
let px = [];                                    // x-coords of bodies
let py = [];                                    // y-coords of bodies
let vx = [];                                    // x-velocities of bodies
let vy = [];                                    // y-velocities of bodies
let mass = [];                                  // masses of bodies
let image = [];                                 // image objects for all bodies

// Initialize net force arrays and other vars that will help with physics calculations
let fx = [];
let fy = [];
let bigG = 6.67e-11;
let dx, dy;
let ax, ay;
let r;
let f;

// Initialize the HTML canvas, moving origin to center
let myCanvas = document.getElementById("myCanvas");
let ctx = myCanvas.getContext("2d");
ctx.translate(250, 250); // Dimensions of canvas object are 500x500px

// Declare vars that will be used during starting/stopping animation
let animation;                              // Stores instance of setInterval()
let audio = new Audio("./media/2001.mp3");  // Stores playback audio
let animationIsRunning = false;

// Store start/stop button as element object
let startStopButton = document.getElementById("startStopButton");

// Store "What's This?" button as element object
let about = document.getElementById("about");
let aboutButtonIsHidden = true;

/***************************** FUNCTIONS **************************/

// Function for initializing universe by reading universeStrSplit
function initializeUniverse() {
    let stringIndex = 2;
    while (stringIndex < universeStrSplit.length) {
        px.push(parseFloat(universeStrSplit[stringIndex]));
        stringIndex++;
        py.push(parseFloat(universeStrSplit[stringIndex]));
        stringIndex++;
        vx.push(parseFloat(universeStrSplit[stringIndex]));
        stringIndex++;
        vy.push(parseFloat(universeStrSplit[stringIndex]));
        stringIndex++;
        mass.push(parseFloat(universeStrSplit[stringIndex]));
        stringIndex++;
        let imgObj = new Image();
        imgObj.src = "./media/" + universeStrSplit[stringIndex];
        image.push(imgObj);
        stringIndex++;
    }
}

// Function for resetting universe to its original state by reading universeStrSplit
// Since mass[] and image[] contain constant info, those remain unmodified
function resetUniverse() {
    px.length = 0;
    py.length = 0;
    vx.length = 0;
    vy.length = 0;
    let stringIndex = 2;
    while (stringIndex < universeStrSplit.length) {
        px.push(parseFloat(universeStrSplit[stringIndex]));
        stringIndex++;
        py.push(parseFloat(universeStrSplit[stringIndex]));
        stringIndex++;
        vx.push(parseFloat(universeStrSplit[stringIndex]));
        stringIndex++;
        vy.push(parseFloat(universeStrSplit[stringIndex]));
        stringIndex += 3;   // we skip the mass and image columns for each body
    }
}

// Function for updating positions of bodies at each time step
// Will get called within the animation function below
// (This function is the heart of your app, since it actually performs the NBody simulation)
function updatePositions() {
    // Calculate net forces acting on each body
    for (let i = 0; i < n; i++) {
        // Initialize net forces to zero
        fx[i] = 0;
        fy[i] = 0;

        // Calculate net force as sum of all pairwise forces in both x and y directions
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                dx = px[j] - px[i];
                dy = py[j] - py[i];
                r = Math.sqrt((dx * dx) + (dy * dy));
                f = bigG * mass[i] * mass[j] / (r * r);
                fx[i] += f * dx / r;
                fy[i] += f * dy / r;
            }
        }
    }

    // Update velocities and positions
    for (let i = 0; i < n; i++) {
        ax = fx[i] / mass[i];
        ay = fy[i] / mass[i];
        vx[i] += ax * dt;
        vy[i] += ay * dt;
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;
    }
}

// Function for displaying one frame of NBody animation in <canvas>
function displayFrame() {
    // Clear canvas
    ctx.clearRect(-250, -250, 500, 500);

    // Display all bodies
    for (let i = 0; i < image.length; i++) {
        // Convert px[i] and py[i] into canvas pixels
        let x = 250 * (px[i] / radius);
        let y = -250 * (py[i] / radius); // minus sign because moving up means moving in -y direction in <canvas>

        // Correct for the fact that StdDraw displays an image centered at (x,y)
        // while <canvas> displays an image whose top-left corner is at (x,y)
        x -= image[i].width / 2;
        y -= image[i].height / 2;
        
        ctx.drawImage(image[i], x, y);
    }

    // Update px[] and py[] for the next frame
    updatePositions();
}

// Function for starting animation. Called when "start" button is pressed.
function startAnimation() {
    resetUniverse();
    animation = window.setInterval(displayFrame, 40);
    audio.play();

    // Display the "What's This" button the first time the animation starts
    if (aboutButtonIsHidden) {
        about.style.display = "block";
        aboutButtonIsHidden = false;
    }
}

// Function for stopping the animation. Called when "stop" button is pressed
function stopAnimation() {
    window.clearInterval(animation);
    ctx.clearRect(-250, -250, 500, 500);
    audio.pause();
    audio.currentTime = 0;
}

// Function for handling clicking the start/stop button
function handleClick() {
    if (!animationIsRunning) {
        startAnimation();
        startStopButton.style.fontSize = "32px";
        startStopButton.innerHTML = "<p>STOP</p>";
        animationIsRunning = true;
    }
    else {
        stopAnimation();
        startStopButton.style.fontSize = "16px";
        startStopButton.innerHTML = "<p>CLICK HERE TO CRY TEARS OF JOY</p>";
        animationIsRunning = false;
    }
}

/***************************** MAIN SECTION **************************/

// Initialize the universe from universeStrSplit
initializeUniverse();

// Check if all images have loaded
let numImgs = image.length;
let numImgsLoaded = 0;
for (let i = 0; i < numImgs; i++) {
    image[i].onload = function() {
        // Increment numImgsLoaded after each image has loaded
        numImgsLoaded++;

        // If all images have loaded, activate button
        if (numImgsLoaded === numImgs) {
            startStopButton.style.fontSize = "16px";
            startStopButton.innerHTML = "<p>CLICK HERE TO CRY TEARS OF JOY</p>";
            startStopButton.addEventListener("click", handleClick);
        }
    }
}