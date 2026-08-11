import React, { useState } from 'react';

/**
 * AIJsonPaster Component
 * 
 * Auto-extracts tip amount from AI raw output or JSON responses.
 * 
 * @param {Object} props
 * @param {Function} props.onDataParsed Callback when amount is successfully extracted
 */
export default function AIJsonPaster({ onDataParsed }) {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(false);

  const handleAutoFill = () => {
    const val = inputText.trim();
    let cleanVal = val.replace(/```json|```/g, '').trim();
    let amount = null;

    // 1. Try parsing as JSON
    try {
      const data = JSON.parse(cleanVal);
      if (data && typeof data === 'object') {
        if (data.total_tips !== undefined && !isNaN(parseFloat(data.total_tips))) {
          amount = parseFloat(data.total_tips);
        } else if (data.total_credit_tips !== undefined && data.total_cash_tips !== undefined) {
          const credit = parseFloat(data.total_credit_tips) || 0;
          const cash = parseFloat(data.total_cash_tips) || 0;
          amount = credit + cash;
        }
      }
    } catch (e) {
      // JSON parsing failed, fallback to regex
    }

    // 2. Fallback to Regex extraction
    if (amount === null) {
      const match = val.match(/\d+\.\d{2}/);
      if (match) {
        amount = parseFloat(match[0]);
      }
    }

    // 3. Handle result
    if (amount !== null && !isNaN(amount) && amount > 0) {
      onDataParsed(amount.toFixed(2));
      setInputText('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="ai-paster-container mb-4 w-full">
      <label 
        htmlFor="aiOutputPaster" 
        className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"
      >
        ✨ Auto-Fill with AI Output
      </label>
      <textarea
        id="aiOutputPaster"
        rows={3}
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
          if (error) setError(false);
        }}
        placeholder="Paste raw text or JSON response from Gemini/AI..."
        className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-100 text-xs font-normal focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none placeholder-slate-500 transition-all duration-200"
      />
      <div className="flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={handleAutoFill}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md text-xs font-bold cursor-pointer transition-all duration-200 active:scale-95 self-start"
        >
          Auto-Fill Calculator
        </button>
        {error && (
          <div className="text-red-500 text-xs font-medium mt-1">
            Could not find a valid tip amount. Please enter manually.
          </div>
        )}
      </div>
    </div>
  );
}
