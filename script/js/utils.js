/* ================================================
   UTILS - Jasmine Rice Game
   Pure helpers and the audio manager. No DOM access lives here.

   Carried from Project Pocky Lucky Draw with its probability engine
   removed - this game has no randomness. The answer is deterministic,
   so there is nothing to weight, shuffle or simulate.
   ================================================ */

const Utils = {
    /**
     * Delay execution
     * @param {Number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Start the kiosk idle timer
     * @param {Function} callback - Function to call after the timer expires
     * @param {Number} ms - Idle window, defaults to 30 seconds
     * @returns {Number} Timer ID
     */
    startAutoResetTimer(callback, ms = 30000) {
        return setTimeout(callback, ms);
    },

    /**
     * Clear timer
     * @param {Number} timerId - Timer ID to clear
     */
    clearTimer(timerId) {
        if (timerId) {
            clearTimeout(timerId);
        }
    },

    /**
     * Log debug message (disabled in production)
     * @param {String} message - Message to log
     * @param {*} data - Optional data to log
     */
    debug(message, data = null) {
        // Debug logging disabled for production
    }
};

// Debug mode disabled for production
window.DEBUG_MODE = false;

/* ================================================
   AUDIO MANAGER

   NOTE: this const shadows the browser's own Audio constructor, so
   every instantiation below MUST use `new window.Audio(...)`. Copying
   this object without that detail breaks it silently.
   ================================================ */

const Audio = {
    // Audio elements
    bgm: null,
    tap: null,
    correct: null,
    wrong: null,

    // Audio settings
    bgmVolume: 0.25,
    sfxVolume: 0.6,

    // BGM must wait for a user gesture - see startBGM below
    bgmStarted: false,

    /**
     * Initialize all audio files
     */
    init() {
        Utils.debug('Audio system initializing...');

        this.bgm = new window.Audio('sound/BGM.mp3');
        this.bgm.loop = true;
        this.bgm.volume = this.bgmVolume;

        this.tap = new window.Audio('sound/Tap.mp3');
        this.tap.volume = this.sfxVolume;

        this.correct = new window.Audio('sound/Success.mp3');
        this.correct.volume = this.sfxVolume;

        this.wrong = new window.Audio('sound/Fail.mp3');
        this.wrong.volume = this.sfxVolume;

        Utils.debug('Audio system initialized');
    },

    /**
     * Start the background loop.
     *
     * Browsers block autoplay until the page has had a user gesture, and
     * this game has no start button - it boots straight into screen 1.
     * So the music starts on the player's FIRST tap and runs from then
     * on. Calling this repeatedly is safe; it only ever starts once.
     */
    startBGM() {
        if (!this.bgm || this.bgmStarted) return;
        this.bgmStarted = true;
        this.bgm.play().catch(err => {
            // Still blocked - let the next gesture try again
            this.bgmStarted = false;
            Utils.debug('BGM autoplay blocked:', err);
        });
    },

    /**
     * Stop the background loop
     */
    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
            this.bgmStarted = false;
        }
    },

    /**
     * Play the option tap sound
     */
    playTap() {
        this.play(this.tap);
    },

    /**
     * Play the answer result sound
     * @param {Boolean} isCorrect - Whether the answer was right
     */
    playResultSound(isCorrect) {
        this.play(isCorrect ? this.correct : this.wrong);
    },

    /**
     * Play a sound from the start, tolerating autoplay blocks
     * @param {Object} sound - Audio element to play
     */
    play(sound) {
        if (!sound) return;
        sound.currentTime = 0; // Reset so rapid re-triggers still fire
        sound.play().catch(err => Utils.debug('Sound error:', err));
    },

    /**
     * Set SFX volume
     * @param {Number} volume - Volume level (0.0 to 1.0)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        [this.tap, this.correct, this.wrong].forEach(sound => {
            if (sound) sound.volume = this.sfxVolume;
        });
    },

    /**
     * Set BGM volume
     * @param {Number} volume - Volume level (0.0 to 1.0)
     */
    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgm) {
            this.bgm.volume = this.bgmVolume;
        }
    }
};
