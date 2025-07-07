// frontend/src/components/CurrencySelector.jsx
import React, { useState } from 'react';
import { X, Check, Globe } from 'lucide-react';
import { currencyService, useCurrency } from '../services/currencyService';
import toast from 'react-hot-toast';

const CurrencySelector = ({ onClose }) => {
  const { currency: currentCurrency, changeCurrency } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const currencies = currencyService.getAllCurrencies();

  const handleSave = () => {
    changeCurrency(selectedCurrency);
    toast.success(`Currency changed to ${currencies.find(c => c.code === selectedCurrency)?.name}! 💰`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="currency-selector-modal glass-card">
        <div className="modal-header">
          <h3>
            <Globe size={20} />
            Select Currency
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="currency-list">
          {currencies.map((curr) => (
            <div 
              key={curr.code}
              className={`currency-option ${selectedCurrency === curr.code ? 'selected' : ''}`}
              onClick={() => setSelectedCurrency(curr.code)}
            >
              <div className="currency-info">
                <span className="currency-symbol">{curr.symbol}</span>
                <div className="currency-details">
                  <span className="currency-name">{curr.name}</span>
                  <span className="currency-code">{curr.code}</span>
                </div>
              </div>
              {selectedCurrency === curr.code && (
                <Check size={20} className="selected-icon" />
              )}
            </div>
          ))}
        </div>

        <div className="currency-preview">
          <h4>Preview</h4>
          <p>
            Sample amount: {currencyService.formatAmount(1234.56, selectedCurrency)}
          </p>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Check size={16} />
            Apply Currency
          </button>
        </div>
      </div>
    </div>
  );
};

// CSS for Currency Selector (add to your main CSS file)
const currencySelectorStyles = `
.currency-selector-modal {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.currency-list {
  max-height: 400px;
  overflow-y: auto;
  margin: 1rem 0;
}

.currency-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.currency-option:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-primary);
}

.currency-option.selected {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--accent-primary);
}

.currency-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.currency-symbol {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-primary);
  min-width: 40px;
  text-align: center;
}

.currency-details {
  display: flex;
  flex-direction: column;
}

.currency-name {
  font-weight: 600;
  color: var(--text-primary);
}

.currency-code {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.selected-icon {
  color: var(--accent-primary);
}

.currency-preview {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin: 1rem 0;
  text-align: center;
}

.currency-preview h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.currency-preview p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--accent-primary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.modal-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .currency-selector-modal {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
  }
}
`;

export default CurrencySelector;