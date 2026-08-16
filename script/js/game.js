/* ================================================
   GAME - Jasmine Rice Game
   Game state and the answer rule.

   The entire rule of this game lives in ANSWER_KEY below and nowhere
   else. If the client revises the cooking ratios, that object is the
   only thing that changes.
   ================================================ */

const Game = {
    // Which rice the player picked on screen 1. Null between rounds.
    state: {
        riceType: null
    },

    /**
     * Correct water measure per rice type, confirmed by Kiyo.
     *   Beras Wangi    (Jasmine Sunwhite)   -> 1 1/2 cawan air
     *   Beras Basmathi (Jasmine Pusa Cream) -> 1 cawan air
     * 1/2 cawan is never correct for either.
     *
     * Values match the data-water attributes in index.html.
     */
    ANSWER_KEY: {
        wangi: '1.5',
        basmathi: '1'
    },

    /**
     * Initialize game state
     */
    init() {
        this.reset();
        Utils.debug('Game initialized');
    },

    /**
     * Screen 1 - player picked a rice type
     * @param {String} riceType - "wangi" or "basmathi"
     */
    selectRice(riceType) {
        if (!this.ANSWER_KEY.hasOwnProperty(riceType)) {
            Utils.debug('Unknown rice type:', riceType);
            return;
        }
        this.state.riceType = riceType;
        Utils.debug('Rice selected:', riceType);
    },

    /**
     * Screen 2 - player picked a water measure
     * @param {String} choice - "1.5", "1" or "0.5"
     * @returns {Boolean} Whether the choice is correct for the chosen rice
     */
    isCorrectWater(choice) {
        return choice === this.ANSWER_KEY[this.state.riceType];
    },

    /**
     * Clear state for a fresh round. Called on TERUSKAN and on idle
     * timeout - never on CUBA LAGI, which deliberately keeps the rice
     * choice so the player only re-answers the question they got wrong.
     */
    reset() {
        this.state.riceType = null;
        Utils.debug('Game reset');
    }
};
