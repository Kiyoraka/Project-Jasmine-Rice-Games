/* ================================================
   UI - Jasmine Rice Game
   Screen flow, transitions and event wiring.

   Screen order:
     rice -> water -> wrong  -> (CUBA LAGI) -> water
                   -> correct -> (TERUSKAN) -> rice
   ================================================ */

const UI = {
    screens: {},
    currentScreen: 'rice',
    idleTimer: null,
    isTransitioning: false,

    /**
     * Cache screens and wire every listener once. Nothing in this game
     * is created dynamically, so listeners can never accumulate.
     */
    init() {
        this.screens = {
            rice: document.getElementById('rice-screen'),
            water: document.getElementById('water-screen'),
            wrong: document.getElementById('wrong-screen'),
            correct: document.getElementById('correct-screen')
        };

        this.setupEventListeners();
        Utils.debug('UI initialized');
    },

    setupEventListeners() {
        // Screen 1 - rice option cards
        document.querySelectorAll('[data-rice]').forEach(el => {
            el.addEventListener('click', () => this.onRiceChosen(el));
        });

        // Screen 2 - water measure bars
        document.querySelectorAll('[data-water]').forEach(el => {
            el.addEventListener('click', () => this.onWaterChosen(el));
        });

        // Screen 3 - CUBA LAGI, retry the water question only
        document.getElementById('hs-retry')
            .addEventListener('click', () => this.onRetry());

        // Screen 4 - TERUSKAN, start a fresh round
        document.getElementById('hs-continue')
            .addEventListener('click', () => this.onContinue());
    },

    /* ================================================
       PLAYER ACTIONS
       ================================================ */

    async onRiceChosen(el) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        Audio.playTap();
        this.markSelected(el, '[data-rice]');
        Game.selectRice(el.dataset.rice);

        await Utils.delay(320);
        await this.showScreen('water');
        this.clearSelection('[data-rice]');
        this.isTransitioning = false;
    },

    async onWaterChosen(el) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        Audio.playTap();
        this.markSelected(el, '[data-water]');

        const isCorrect = Game.isCorrectWater(el.dataset.water);

        await Utils.delay(320);
        Audio.playResultSound(isCorrect);
        await this.showScreen(isCorrect ? 'correct' : 'wrong');
        this.clearSelection('[data-water]');
        this.isTransitioning = false;
    },

    async onRetry() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        Audio.playTap();
        // Deliberately keeps Game.state.riceType - the player only
        // re-answers the question they actually got wrong.
        await this.showScreen('water');
        this.isTransitioning = false;
    },

    async onContinue() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        Audio.playTap();
        Game.reset();
        await this.showScreen('rice');
        this.isTransitioning = false;
    },

    /* ================================================
       SELECTION FEEDBACK
       ================================================ */

    /**
     * Lift the chosen option and freeze the rest, so a fast double tap
     * cannot register two different answers.
     */
    markSelected(el, siblingSelector) {
        document.querySelectorAll(siblingSelector).forEach(other => {
            other.classList.add('locked');
        });
        el.classList.add('selected');
    },

    clearSelection(siblingSelector) {
        document.querySelectorAll(siblingSelector).forEach(el => {
            el.classList.remove('selected', 'locked');
        });
    },

    /* ================================================
       SCREEN FLOW
       ================================================ */

    /**
     * Cross-fade to a screen.
     * The 400ms delay is matched BY HAND to the screenFadeOut duration
     * in animations.css. If that duration changes, change this too.
     */
    async showScreen(name) {
        const next = this.screens[name];
        const current = this.screens[this.currentScreen];
        if (!next || name === this.currentScreen) return;

        Utils.clearTimer(this.idleTimer);

        if (current) {
            current.classList.add('screen-fade-out');
            await Utils.delay(400);
            current.classList.add('hidden');
            current.classList.remove('screen-fade-out');
        }

        next.classList.remove('hidden');
        next.classList.add('screen-fade-in');
        this.currentScreen = name;

        await Utils.delay(400);
        next.classList.remove('screen-fade-in');

        this.startIdleWatch();
    },

    /**
     * Kiosk behaviour: any screen except the first returns to the start
     * after 30s untouched, so an abandoned session never strands the
     * next player mid-question.
     */
    startIdleWatch() {
        Utils.clearTimer(this.idleTimer);
        if (this.currentScreen === 'rice') return;

        this.idleTimer = Utils.startAutoResetTimer(async () => {
            Game.reset();
            this.clearSelection('[data-rice]');
            this.clearSelection('[data-water]');
            await this.showScreen('rice');
        });
    }
};
