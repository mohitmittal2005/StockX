// ── Init ──
    window.addEventListener('DOMContentLoaded', () => {
      // API key is pre-configured
      document.getElementById('apiBanner').classList.add('hidden');
      document.getElementById('apiNudge').classList.add('hidden');
      document.getElementById('liveBadge').style.display = 'inline-flex';
      localStorage.setItem('stockx_api_key', API_KEY);
      startLiveData();
      initGainsChart();
      renderPortfolioCards();
      renderWatchlist();
      updateMarketStatus();
      setInterval(updateMarketStatus, 60000);
    });
