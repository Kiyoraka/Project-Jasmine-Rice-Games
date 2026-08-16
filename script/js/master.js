/* ================================================
   MASTER - Jasmine Rice Game
   Bootstrap, viewport setup and touch handling.

   Carried near-verbatim from Project Pocky Lucky Draw. There is no
   resize listener and no devicePixelRatio handling by design - the
   letterbox is pure CSS and DPI is absorbed by shipping oversized art.
   ================================================ */

const App = {
    /**
     * Initialize the application
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },

    start() {
        this.initializeModules();
        this.setupViewport();
        this.setupTouchEvents();
    },

    initializeModules() {
        Audio.init();
        Game.init();
        UI.init();
    },

    /**
     * Setup viewport for 9:16 aspect ratio
     */
    setupViewport() {
        // Prevent zoom on touch devices
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 100);
        });
    },

    /**
     * Setup touch event optimizations
     */
    setupTouchEvents() {
        document.body.classList.add('touch-device');

        if ('ontouchstart' in window) {
            document.body.style.cursor = 'default';
        }
    },

    /**
     * Swallow errors silently. This runs unattended in front of
     * customers - nothing may ever surface a dialog or a stack trace.
     */
    handleError(error) {
        Utils.debug('Application error:', error);
    }
};

// Global error handler
window.addEventListener('error', (e) => {
    App.handleError(e.error);
});

// Initialize app
App.init();
