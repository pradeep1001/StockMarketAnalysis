const API_KEY = '28f44f1352ac7bf3b26d0dbfa7e53ccd';
const BASE_URL = 'http://api.marketstack.com/v1';

async function getStockTickers(exchange = 'XNAS', limit = 50) {
    try {
        const response = await fetch(`${BASE_URL}/tickers?access_key=${API_KEY}&exchange=${exchange}&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(`API error: ${data.error.message}`);
        }
        return data.data;
    } catch (error) {
        console.error("Error fetching stock tickers:", error);
        alert(`Error fetching stock tickers: ${error.message}`);
    }
}

function populateTickerDropdown(tickers) {
    const dropdown = document.getElementById('tickerDropdown');
    dropdown.innerHTML = '<option value="">Select a ticker</option>';

    tickers.slice(0, 10).forEach(ticker => {
        const option = document.createElement('option');
        option.value = JSON.stringify({ symbol: ticker.symbol, name: ticker.name });
        option.textContent = `${ticker.name} (${ticker.symbol})`;
        dropdown.appendChild(option);
    });

    if (tickers.length > 10) {
        const moreOption = document.createElement('option');
        moreOption.disabled = true;
        moreOption.textContent = `... and ${tickers.length - 10} more`;
        dropdown.appendChild(moreOption);
    }
}

async function displaySelectedTicker() {
    const dropdown = document.getElementById('tickerDropdown');
    const selectedValue = JSON.parse(dropdown.value || '{}');

    if (!selectedValue.symbol) {
        alert('Please select a stock ticker');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/eod/latest?access_key=${API_KEY}&symbols=${selectedValue.symbol}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(`API error: ${data.error.message}`);
        }
        if (!data.data || data.data.length === 0) {
            throw new Error('No data available for this ticker');
        }
        displayStockInfo(data.data[0], selectedValue.name);
    } catch (error) {
        console.error("Error fetching stock data:", error);
        alert(`Error fetching stock data: ${error.message}. Please try again.`);
    }
}

function displayStockInfo(stockData, companyName) {
    const stockInfo = document.getElementById('selectedTickerInfo');
    stockInfo.innerHTML = `
        <p class="text-xl font-semibold mb-4">Stock Information for ${companyName} (${stockData.symbol})</p>
        <p class="mb-2">Open is ${stockData.open.toFixed(2)}</p>
        <p class="mb-2">High is ${stockData.high.toFixed(2)}</p>
        <p class="mb-2">Low is ${stockData.low.toFixed(2)}</p>
        <p class="mb-2">Close is ${stockData.close.toFixed(2)}</p>
        <p class="mb-2">Volume is ${stockData.volume.toFixed(1)}</p>
    `;
    stockInfo.classList.remove('hidden');
}

async function initializeApp() {
    try {
        const tickers = await getStockTickers();
        if (tickers && tickers.length > 0) {
            populateTickerDropdown(tickers);
        } else {
            throw new Error('No tickers received from the API');
        }
    } catch (error) {
        console.error("Error initializing app:", error);
        alert(`Error initializing app: ${error.message}`);
    }
}

window.onload = initializeApp;