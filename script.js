let count = 0;
let energy = 5000; // Starting energy value
const maxEnergy = 5000; // Maximum energy value
const energyRechargeRate = 1; // Energy recharge rate
const rechargeInterval = 30000; // Recharge every 30 seconds
let lastUpdateTime = Date.now(); // Track last update time
let level = 1; // Starting level
const levelUpThreshold = 500; // Coins needed to level up
let coinsPerClick = 1; // Coins earned per click

// Function to expand the Telegram Web App to full height
function expandWebApp() {
    // Ensure Telegram WebApp is ready before attempting to expand
    Telegram.WebApp.ready(() => {
        Telegram.WebApp.expand();
    });
}

function loadCounter() {
    const savedCount = localStorage.getItem('kimchiCounter');
    const savedEnergy = localStorage.getItem('kimchiEnergy');
    const savedLastUpdate = localStorage.getItem('lastUpdateTime');

    if (savedCount) {
        count = parseInt(savedCount, 10);
        document.getElementById('count').innerText = count;
    }

    if (savedEnergy) {
        energy = Math.min(parseInt(savedEnergy, 10), maxEnergy); // Cap energy at max
    }

    if (savedLastUpdate) {
        lastUpdateTime = parseInt(savedLastUpdate, 10);
        const elapsedTime = Date.now() - lastUpdateTime;
        energy += Math.floor(elapsedTime / rechargeInterval) * energyRechargeRate;
        energy = Math.min(energy, maxEnergy); // Cap energy at max
    }

    updateEnergyBar(); // Initialize energy bar display
    updateLevelDisplay(); // Initialize level display
}

function saveCounter() {
    localStorage.setItem('kimchiCounter', count);
    localStorage.setItem('kimchiEnergy', energy);
    localStorage.setItem('lastUpdateTime', Date.now()); // Update last update time
}

function imageClicked(event) {
    event.preventDefault(); // Prevent default behavior
    const touches = event.touches || [{ clientX: event.clientX, clientY: event.clientY }];
    const touchCount = touches.length;

    if (energy <= 0) {
        alert("Not enough energy to click the cabbage!");
        return; // Prevent clicking if energy is 0
    }

    count += touchCount * coinsPerClick; // Increment count based on the number of touches
    energy -= touchCount; // Reduce energy with each click
    energy = Math.max(energy, 0); // Prevent negative energy

    document.getElementById('count').innerText = count;
    saveCounter();
    updateEnergyBar(); // Update energy bar display
    updateLevel(); // Check for level up

    // Reset and play animation
    const cabbageImage = document.querySelector('#clickable-image img');
    cabbageImage.classList.remove('clicked'); // Reset any existing animation
    void cabbageImage.offsetWidth; // Trigger reflow
    cabbageImage.classList.add('clicked'); // Add highlight class for animation

    animateCounter(document.getElementById('count'));

    // Play sound and provide haptic feedback
    playClickSound();
    provideFeedback(touches, coinsPerClick); // Pass coinsPerClick to provideFeedback

    // Remove the highlight class after animation duration
    setTimeout(() => {
        cabbageImage.classList.remove('clicked');
    }, 300); // Match this duration with your CSS animation duration
}

function updateLevel() {
    while (count >= level * levelUpThreshold) {
        level++;
        coinsPerClick = level; // Increase coins per click
        updateLevelDisplay(); // Update level display
    }
}

function updateLevelDisplay() {
    const levelDisplay = document.getElementById('level-value');
    levelDisplay.innerText = `Lvl: ${level}`; // Correctly update the displayed level
}

function animateCounter(countElement) {
    countElement.style.transform = 'scale(1.2)'; // Scale up
    setTimeout(() => {
        countElement.style.transform = 'scale(1)'; // Scale back down
    }, 300); // Duration of the scale effect
}

function createFeedback(x, y, amount) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.innerText = `+${amount}`; // Display the amount of coins
    feedback.style.position = 'absolute'; // Positioning for animation
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.style.opacity = 1; // Start fully visible
    document.body.appendChild(feedback);

    // Animation for moving up and fading out
    feedback.animate([
        { transform: 'translateY(0)', opacity: 1 }, // Start position
        { transform: 'translateY(-30px)', opacity: 0 } // End position
    ], {
        duration: 600, // Total duration of the animation
        easing: 'ease-out',
        fill: 'forwards' // Retain the final state
    });

    // Remove the feedback element after animation
    setTimeout(() => {
        feedback.remove();
    }, 600);
}

function updateEnergyBar() {
    const energyFill = document.getElementById('energy-fill');
    const energyValue = document.getElementById('energy-count');
    energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
    energyValue.innerText = energy;
}

function rechargeEnergy() {
    const now = Date.now();
    const elapsedTime = now - lastUpdateTime;
    const rechargeAmount = Math.floor(elapsedTime / rechargeInterval) * energyRechargeRate;

    if (rechargeAmount > 0) {
        energy = Math.min(energy + rechargeAmount, maxEnergy); // Cap energy at max
        lastUpdateTime = now; // Update the last update time
        updateEnergyBar();
        saveCounter(); // Save the updated energy
    }
}

function startRechargeTimer() {
    setInterval(rechargeEnergy, rechargeInterval);
}

function playClickSound() {
    const audio = new Audio('./assets/click.mp3'); // Ensure the correct path to the sound file
    audio.play().catch(error => console.error('Error playing sound:', error));
}

function provideFeedback(touches, amount) {
    for (let touch of touches) {
        createFeedback(touch.clientX, touch.clientY, amount); // Pass amount to createFeedback
    }
}

// Function to prevent swipe down gesture
function disableSwipeDownGesture() {
    window.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            // Prevent the default action if the user is trying to scroll down
            event.preventDefault();
        }
    }, { passive: false }); // Make sure to set passive to false
}

// Call the function to disable swipe down
disableSwipeDownGesture();


// Attach event listeners for load event
window.addEventListener('load', () => {
    expandWebApp(); // Expand the Telegram Web App to full height
    loadCounter();
    startRechargeTimer(); // Start the recharge timer
});

// Ensure that the expand function is also called when the Web App is initialized
Telegram.WebApp.onEvent('visibilityChanged', (visibility) => {
    if (visibility === 'visible') {
        expandWebApp();
    }
});


window.addEventListener('beforeunload', saveCounter);