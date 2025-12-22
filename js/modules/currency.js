// ==========================================================================
// currency.js - Módulo para la conversión de monedas (Versión con Tasas de Respaldo Corregidas)
// ==========================================================================

// Usaremos la API gratuita de exchangerate-api.com
const API_URL = 'https://v6.exchangerate-api.com/v6/latest/USD';

let exchangeRates = null;
let lastFetched = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos en milisegundos

/**
 * Obtiene las tasas de cambio desde la API o desde la caché.
 * @returns {Promise<object>} Un objeto con las tasas de cambio.
 */
const fetchExchangeRates = async () => {
    const now = Date.now();
    
    // Si las tasas están en caché y son recientes, las usamos
    if (exchangeRates && lastFetched && (now - lastFetched < CACHE_DURATION)) {
        console.log('Usando tasas de cambio desde la caché.');
        return exchangeRates;
    }

    console.log('Obteniendo nuevas tasas de cambio desde la API...');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error en la API: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (data.result === 'success') {
            exchangeRates = data.conversion_rates;
            lastFetched = now;
            console.log('Tasas de cambio actualizadas:', exchangeRates);
            return exchangeRates;
        } else {
            throw new Error(data.error_type || 'Error desconocido al obtener tasas.');
        }
    } catch (error) {
        console.error('No se pudieron obtener las tasas de cambio. Usando valores de respaldo corregidos.', error);
        // --- CORRECCIÓN CLAVE: Tasas de respaldo en el formato CORRECTO (1 USD = X MONEDA) ---
        // Estos valores representan cuántas unidades de cada moneda equivalen a 1 USD.
        return { 
            USD: 1, 
            ARS: 833.33, // 1 USD ≈ 833.33 ARS
            BRL: 5.00,    // 1 USD ≈ 5.00 BRL
            EUR: 0.92     // 1 USD ≈ 0.92 EUR
        }; 
    }
};

/**
 * Convierte un monto de una moneda a otra.
 * @param {number} amount - El monto a convertir.
 * @param {string} fromCurrency - La moneda de origen (ej: 'USD').
 * @param {string} toCurrency - La moneda de destino (ej: 'ARS').
 * @returns {Promise<number>} El monto convertido.
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    const rates = await fetchExchangeRates();
    
    // Primero convertimos el monto a USD (la moneda base de la API)
    const amountInUSD = amount / rates[fromCurrency];
    
    // Luego convertimos de USD a la moneda de destino
    const convertedAmount = amountInUSD * rates[toCurrency];
    
    return convertedAmount;
};

/**
 * Formatea un número como una cadena de moneda.
 * @param {number} amount - El monto.
 * @param {string} currencyCode - El código de la moneda (ej: 'ARS', 'USD').
 * @returns {string} El monto formateado (ej: '$15,000.00').
 */
export const formatCurrency = (amount, currencyCode) => {
    return new Intl.NumberFormat('es-AR', { // Usamos locale de Argentina para el formato
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
    }).format(amount);
};