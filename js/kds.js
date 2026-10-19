/**
 * Maithili Agro Tourism — Mulshi · Pune - Hotel Management System
 * Kitchen Display System (KDS) Real-Time Engine
 */

const KDSModule = {
    stationFilter: 'All',
    timerInterval: null,

    init: function () {
        this.renderKDSBoard();
        this.setupEventListeners();
        this.startTimerLoop();
    },

    setupEventListeners: function () {
        // Real-time listener for incoming KOTs
        window.addEventListener('kotPunched', (e) => {
            this.playChime();
            this.renderKDSBoard();
            App.showToast(`New Ticket: ${e.detail.kot.kotId} for ${e.detail.order.tableNumber}!`, 'info');
        });

        window.addEventListener('storageUpdated', () => {
            this.renderKDSBoard();
        });
    },

    startTimerLoop: function () {
        if (this.timerInterval) clearInterval(this.timerInterval);
        // Refresh timers every second for live countdown / count-up
        this.timerInterval = setInterval(() => {
            this.updateTimers();
        }, 1000);
    },

    // Audio chime for new kitchen ticket
    playChime: function () {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        } catch (e) {
            // Audio context not allowed or not supported, ignore silently
        }
    },

    // Toggle Station Filter
    setStationFilter: function (station) {
        this.stationFilter = station;
        const buttons = document.querySelectorAll('.kds-station-filter-btn');
        buttons.forEach(btn => {
            if (btn.getAttribute('data-station') === station) {
                btn.className = 'btn btn-sm btn-gold kds-station-filter-btn';
            } else {
                btn.className = 'btn btn-sm btn-outline-secondary kds-station-filter-btn text-white';
            }
        });
        this.renderKDSBoard();
    },

    // Render KDS Board & Summary
    renderKDSBoard: function () {
        const boardContainer = document.getElementById('kdsBoardGrid');
        const summaryContainer = document.getElementById('kdsActiveCookingSummary');
        const activeCountBadge = document.getElementById('kdsActiveTicketsCount');

        if (!boardContainer) return;

        const kots = StorageService.getAllKOTs();
        
        // Filter out Served/Completed
        const activeKots = kots.filter(k => k.status !== 'Served');

        if (activeCountBadge) activeCountBadge.textContent = activeKots.length;

        // Render Active Cooking Items Summary Bar
        if (summaryContainer) {
            const itemCounts = {};
            activeKots.forEach(k => {
                k.items.forEach(item => {
                    itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
                });
            });

            const summaryPills = Object.entries(itemCounts).map(([name, count]) => `
                <span class="badge bg-navy-surface border border-secondary text-white py-1 px-2" style="font-size:0.75rem;">
                    <strong class="text-gold font-monospace me-1">${count}x</strong> ${name}
                </span>
            `).join('');

            summaryContainer.innerHTML = summaryPills || '<span class="text-muted small">No items currently awaiting preparation in kitchen.</span>';
        }

        if (activeKots.length === 0) {
            boardContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-check2-circle display-3 text-success mb-3 d-block"></i>
                    <h4 class="text-white">Kitchen Order Queue is Clear</h4>
                    <p class="text-muted small">All dining orders and room service tickets are prepared and dispatched.</p>
                </div>
            `;
            return;
        }

        let html = '';

        activeKots.forEach(kot => {
            const punchedTime = new Date(kot.punchedAt);
            const now = new Date();
            const elapsedSeconds = Math.max(0, Math.floor((now - punchedTime) / 1000));
            const elapsedMinutes = Math.floor(elapsedSeconds / 60);

            // Determine Timer Urgency Style
            let timerClass = 'timer-green';
            if (elapsedMinutes >= 10 && elapsedMinutes < 20) {
                timerClass = 'timer-amber';
            } else if (elapsedMinutes >= 20) {
                timerClass = 'timer-red';
            }

            const itemsHtml = kot.items.map((item, itemIdx) => `
                <div class="kds-dish-line" id="kot_${kot.kotId}_item_${itemIdx}">
                    <span class="badge bg-gold text-dark font-monospace fs-6 px-2 py-1">${item.quantity}x</span>
                    <div class="flex-grow-1">
                        <div class="fw-bold text-white fs-6">${item.name}</div>
                        ${item.notes ? `
                            <div class="bg-danger bg-opacity-25 border border-danger border-opacity-50 text-warning px-2 py-1 rounded small mt-1 fw-bold" style="font-size:0.78rem;">
                                <i class="bi bi-exclamation-circle-fill me-1"></i>${item.notes}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');

            html += `
                <div class="kds-ticket" id="ticketCard_${kot.kotId}">
                    <!-- Ticket Header -->
                    <div class="kds-ticket-header ${timerClass}">
                        <div>
                            <div class="fs-5 font-heading fw-bold">${kot.tableNumber}</div>
                            <small class="opacity-75">${kot.kotId} • ${kot.serverName || 'Staff'}</small>
                        </div>
                        <div class="text-end font-monospace">
                            <div class="fs-5 fw-bold kds-timer-val" data-punched="${kot.punchedAt}">
                                ${this.formatElapsed(elapsedSeconds)}
                            </div>
                            <span class="badge bg-black bg-opacity-40 text-uppercase" style="font-size:0.65rem;">
                                ${kot.status}
                            </span>
                        </div>
                    </div>

                    <!-- Ticket Dishes List -->
                    <div class="kds-ticket-body">
                        ${itemsHtml}
                    </div>

                    <!-- Kitchen Action Controls -->
                    <div class="p-3 bg-black bg-opacity-30 border-top border-secondary border-opacity-25 d-flex gap-2">
                        ${kot.status === 'Preparing' ? `
                            <button type="button" class="btn btn-warning btn-sm w-100 fw-bold py-2" onclick="KDSModule.markKOTReady('${kot.orderId}', '${kot.kotId}')">
                                <i class="bi bi-bell-fill me-1"></i>Mark Ready
                            </button>
                        ` : kot.status === 'Ready' ? `
                            <button type="button" class="btn btn-success btn-sm w-100 fw-bold py-2" onclick="KDSModule.dispatchKOT('${kot.orderId}', '${kot.kotId}')">
                                <i class="bi bi-check2-all me-1"></i>Dispatch / Bump
                            </button>
                        ` : `
                            <button type="button" class="btn btn-primary btn-sm w-100 fw-bold py-2" onclick="KDSModule.startPreparing('${kot.orderId}', '${kot.kotId}')">
                                <i class="bi bi-play-fill me-1"></i>Start Cooking
                            </button>
                        `}
                    </div>
                </div>
            `;
        });

        boardContainer.innerHTML = html;
    },

    // Format elapsed seconds into mm:ss
    formatElapsed: function (seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    // Update live timer strings
    updateTimers: function () {
        const timerEls = document.querySelectorAll('.kds-timer-val');
        const now = new Date();

        timerEls.forEach(el => {
            const punchedStr = el.getAttribute('data-punched');
            if (punchedStr) {
                const punched = new Date(punchedStr);
                const seconds = Math.max(0, Math.floor((now - punched) / 1000));
                el.textContent = this.formatElapsed(seconds);

                // Update parent header color if crossing thresholds
                const header = el.closest('.kds-ticket-header');
                if (header) {
                    const mins = Math.floor(seconds / 60);
                    if (mins >= 20 && !header.classList.contains('timer-red')) {
                        header.className = 'kds-ticket-header timer-red';
                    } else if (mins >= 10 && mins < 20 && !header.classList.contains('timer-amber')) {
                        header.className = 'kds-ticket-header timer-amber';
                    }
                }
            }
        });
    },

    // Action: Start Preparing
    startPreparing: function (orderId, kotId) {
        StorageService.updateKOTStatus(orderId, kotId, 'Preparing');
        App.showToast(`Ticket ${kotId} is now preparing on cooking station.`, 'info');
        this.renderKDSBoard();
    },

    // Action: Mark Ready
    markKOTReady: function (orderId, kotId) {
        StorageService.updateKOTStatus(orderId, kotId, 'Ready');
        this.playChime();
        App.showToast(`Ticket ${kotId} marked READY for server pickup!`, 'success');
        this.renderKDSBoard();
    },

    // Action: Bump / Dispatch
    dispatchKOT: function (orderId, kotId) {
        StorageService.updateKOTStatus(orderId, kotId, 'Served');
        App.showToast(`Ticket ${kotId} dispatched to guest table.`, 'info');
        this.renderKDSBoard();
    },

    // Fullscreen Toggle
    toggleFullScreen: function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
};
