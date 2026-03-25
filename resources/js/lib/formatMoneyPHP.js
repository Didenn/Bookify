export function formatMoneyPHP(value) {
    const number = Number(value || 0);
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    }).format(number);
}

