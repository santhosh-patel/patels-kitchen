import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MessageSquare, X, Send, Plus, Award, Check, Heart, Flame, Star, Trash2 } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import { useDishes } from '../context/StoreContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import {
  DEFAULT_PROFILE,
  parseProfileUpdates,
  generatePromptChips
} from '../lib/chefAiPrompts';
import { buildMenuListResponse } from '../lib/chefAiMenuQuery';
import { getDishImage, getDishGradient } from '../lib/dishImage';

function MenuItemTable({ title, items, onAdd }) {
  if (!items?.length) return null;

  return (
    <div className="ai-menu-table-wrap">
      {title && <p className="ai-menu-table-heading">{title}</p>}
      <div className="ai-menu-table-scroll">
        <table className="ai-menu-table">
          <thead>
            <tr>
              <th scope="col" className="ai-menu-table-col-image" />
              <th scope="col">Item</th>
              <th scope="col" className="ai-menu-table-col-price">Price</th>
              <th scope="col" className="ai-menu-table-col-action" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const image = getDishImage(item) || item.image;
              return (
                <tr key={item.id}>
                  <td className="ai-menu-table-col-image">
                    {image ? (
                      <img src={image} alt="" className="ai-menu-table-img" loading="lazy" />
                    ) : (
                      <div
                        className="ai-menu-table-img ai-menu-table-img-placeholder"
                        style={{ background: getDishGradient(item.category) }}
                        aria-hidden="true"
                      >
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="ai-menu-table-name">{item.name}</td>
                  <td className="ai-menu-table-price">₹{item.price}</td>
                  <td className="ai-menu-table-col-action">
                    <button
                      type="button"
                      className="btn-ai-table-add"
                      onClick={() => onAdd(item)}
                      aria-label={`Add ${item.name} to plate`}
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormattedText({ text }) {
  if (!text) return null;

  // Replace double asterisks with bold tags
  const parseBold = (str) => {
    if (!str) return '';
    const cleanStr = str.replace(/\*\*\*\*/g, '').replace(/\*\*\s*\*\*/g, '');
    const parts = cleanStr.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ fontWeight: 700, color: 'var(--traditional-brown)' }}>{part}</strong> : part);
  };

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let listType = null; // 'ul' | 'ol'
  let currentTable = [];

  const flushList = (key) => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={key} style={{ margin: '0.4rem 0 0.8rem 1.2rem', padding: 0, listStyleType: 'disc' }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.3rem', fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--deep-charcoal)' }}>
                {parseBold(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={key} style={{ margin: '0.4rem 0 0.8rem 1.2rem', padding: 0 }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.3rem', fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--deep-charcoal)' }}>
                {parseBold(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  const flushTable = (key) => {
    if (currentTable.length > 0) {
      const validRows = currentTable.filter(row => !/^[|\s:-]+$/.test(row.replace(/\s/g, '')));
      
      if (validRows.length > 0) {
        const tableRows = validRows.map(row => 
          row.split('|').map(cell => cell.trim()).filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1)
        );

        const headers = tableRows[0];
        const bodyRows = tableRows.slice(1);

        elements.push(
          <div key={key} style={{ overflowX: 'auto', margin: '0.8rem 0', borderRadius: '8px', border: '1px solid var(--sandstone)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', background: 'var(--pure-white)' }}>
              <thead>
                <tr style={{ background: 'var(--heritage-cream)', borderBottom: '1px solid var(--sandstone)' }}>
                  {headers.map((h, idx) => (
                    <th key={idx} style={{ padding: '0.5rem 0.8rem', fontWeight: 700, color: 'var(--traditional-brown)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rowIdx) => (
                  <tr key={rowIdx} style={{ borderBottom: rowIdx < bodyRows.length - 1 ? '1px solid rgba(184, 138, 59, 0.1)' : 'none' }}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} style={{ padding: '0.5rem 0.8rem', color: '#444' }}>{parseBold(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      currentTable = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Normalize tab-separated or double-space-separated table rows
    if (line.includes('\t')) {
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        line = '| ' + parts.join(' | ') + ' |';
      }
    } else if (line.includes('  ')) {
      const parts = line.split(/ {2,}/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2 && !line.trim().startsWith('-') && !line.trim().startsWith('*') && !/^\d+\./.test(line.trim())) {
        line = '| ' + parts.join(' | ') + ' |';
      }
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushList(`list-${i}`);
      currentTable.push(line);
      continue;
    } else {
      flushTable(`table-${i}`);
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (listType !== 'ul') {
        flushList(`list-${i}`);
        listType = 'ul';
      }
      currentList.push(line.trim().substring(2));
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      if (listType !== 'ol') {
        flushList(`list-${i}`);
        listType = 'ol';
      }
      const match = line.trim().match(/^\d+\.\s(.*)/);
      currentList.push(match ? match[1] : line.trim());
      continue;
    }

    flushList(`list-${i}`);
    if (line.trim() === '') {
      elements.push(<div key={`space-${i}`} style={{ height: '0.5rem' }} />);
    } else {
      elements.push(
        <p key={`p-${i}`} style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', lineHeight: '1.6' }}>
          {parseBold(line)}
        </p>
      );
    }
  }

  flushList('list-final');
  flushTable('table-final');

  return <div>{elements}</div>;
}

const WELCOME_MESSAGE = {
  id: 1,
  sender: 'assistant',
  text: "Pranam! I am Chef AI. How may I assist you with your feast today?"
};

export default function AIAssistant({ onAddToPlate, isOpen, setIsOpen }) {
  const dishes = useDishes();
  const menuData = dishes.filter(d => d.available !== false);
  const findDish = (id) => menuData.find(i => i.id === id);
  
  // Chat messages loaded from session state if present
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('pk_chef_ai_history');
      return saved ? JSON.parse(saved) : [WELCOME_MESSAGE];
    } catch (e) {
      return [WELCOME_MESSAGE];
    }
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  
  // Customer Profile Engine State (Parsed in background for smart scoring)
  const [profile, setProfile] = useState(() => {
    try {
      const saved = sessionStorage.getItem('pk_chef_ai_profile');
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : { ...DEFAULT_PROFILE };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  });

  const chatEndRef = useRef(null);
  const closePanel = useCallback(() => setIsOpen(false), [setIsOpen]);
  const panelRef = useFocusTrap(isOpen, closePanel);

  // Auto scroll to chat end & persist messages to session state
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    try {
      sessionStorage.setItem('pk_chef_ai_history', JSON.stringify(messages));
    } catch (e) {
      console.error("Error saving chat history", e);
    }
  }, [messages, isTyping]);

  // Sync and reset daily limit counter on device
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const storedDate = localStorage.getItem('pk_message_date');
    const storedCount = localStorage.getItem('pk_message_count');

    if (storedDate !== today) {
      localStorage.setItem('pk_message_date', today);
      localStorage.setItem('pk_message_count', '0');
      setDailyMessageCount(0);
    } else if (storedCount) {
      setDailyMessageCount(parseInt(storedCount, 10));
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('pk_chef_ai_profile', JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving Chef AI profile', e);
    }
  }, [profile]);

  const promptChips = useMemo(
    () => generatePromptChips(profile, messages),
    [profile, messages]
  );

  // Vector-like Scoring & Recommendation Engine
  const getRecommendationScores = (activeProfile = profile) => {
    return menuData.map(item => {
      let score = 50; // base score

      // 1. Dietary Preference Filters (Hard constraints)
      if (activeProfile.diet_type === 'vegetarian' && !item.isVeg) {
        score = 0;
      }
      if (activeProfile.diet_type === 'vegan') {
        if (!item.isVeg || item.name.toLowerCase().includes('paneer') || 
            item.description.toLowerCase().includes('butter') || 
            item.description.toLowerCase().includes('ghee') ||
            item.description.toLowerCase().includes('milk') ||
            item.description.toLowerCase().includes('cream')) {
          score = 0;
        }
      }

      // 2. Allergy Exclusions (Hard constraints)
      if (score > 0) {
        const desc = item.description.toLowerCase() + " " + item.name.toLowerCase();
        activeProfile.allergies.forEach(allergy => {
          if (allergy === 'dairy' && (
            desc.includes('butter') || desc.includes('ghee') || desc.includes('paneer') || 
            desc.includes('milk') || desc.includes('cream') || desc.includes('malai') || desc.includes('lassi')
          )) {
            score = 0;
          }
          if (allergy === 'nuts' && (
            desc.includes('apricot') || desc.includes('cashew') || desc.includes('pistachio') || desc.includes('almond') || desc.includes('badam')
          )) {
            score = 0;
          }
          if (allergy === 'seafood' && (
            desc.includes('prawn') || desc.includes('fish')
          )) {
            score = 0;
          }
          if (allergy === 'eggs' && desc.includes('egg')) {
            score = 0;
          }
          if (allergy === 'gluten' && (
            desc.includes('naan') || desc.includes('roti') || desc.includes('bread') || desc.includes('double ka meetha')
          )) {
            score = 0;
          }
        });
      }

      // Apply scoring weights if item passed filters
      if (score > 0) {
        activeProfile.health_goals.forEach(goal => {
          if (goal === 'muscle_gain' || goal === 'high_protein') {
            if (item.category === 'biryanis' || item.category === 'starters') {
              if (item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('mutton') || item.name.toLowerCase().includes('paneer')) {
                score += 20;
              }
            }
          }
          if (goal === 'weight_loss' || goal === 'low_oil') {
            if (item.category === 'breakfast' && (item.id === 'idli-sambar' || item.id === 'upma')) score += 25;
            if (item.id === 'dal-tadka' || item.id === 'vegetable-kurma') score += 20;
            if (item.description.toLowerCase().includes('ghee') || item.description.toLowerCase().includes('butter')) score -= 15;
          }
        });

        if (activeProfile.spice_preference === 'mild') {
          if (item.spiceLevel >= 2) score -= 20;
          if (item.spiceLevel <= 1) score += 15;
        } else if (activeProfile.spice_preference === 'spicy' || activeProfile.spice_preference === 'extra_spicy') {
          if (item.spiceLevel === 3) score += 25;
          if (item.spiceLevel === 2) score += 15;
        }

        if (item.price > activeProfile.budget_range) {
          score -= 30;
        }

        if (activeProfile.group_size >= 3) {
          if (item.id === 'special-family-chicken-biryani' || item.id === 'patel-special-mega-thali') {
            score += 30;
          }
        }
      }

      return { item, score };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score);
  };

  const updateProfileFromText = (text) => {
    const { profile: updated, changed } = parseProfileUpdates(text, profile);
    if (changed) {
      setProfile(updated);
    }
    return updated;
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Enforce 30 message daily cap
    const currentCount = parseInt(localStorage.getItem('pk_message_count') || '0', 10);
    if (currentCount >= 30) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'assistant',
          text: "My royal guest, you have reached your daily limit of 30 culinary consultations for today. I must rest my kitchen gears, but I await your honor again tomorrow morning! (To bypass this constraint in development, you can reset your browser localStorage)."
        }
      ]);
      return;
    }

    const cleanText = text.slice(0, 250);

    // 1. Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: cleanText
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Increment cap
    const nextCount = currentCount + 1;
    localStorage.setItem('pk_message_count', nextCount.toString());
    setDailyMessageCount(nextCount);

    // 2. Parse Profile in background
    const liveProfile = updateProfileFromText(cleanText);

    // 3. Connect to serverless proxy or local simulation
    try {
      await callChefAI(cleanText, false, liveProfile);
    } catch (err) {
      console.error('Chef AI proxy failed, using local fallback.', err);
      try {
        await callChefAI(cleanText, true, liveProfile);
      } catch (fallbackErr) {
        simulateConciergeLogic(cleanText, liveProfile);
      }
    }
  };

  const callChefAI = async (userText, useFallback = false, liveProfile = profile) => {
    const selectedModel = useFallback ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";
    const recommendedList = getRecommendationScores(liveProfile);
    const topSuggestions = recommendedList.slice(0, 5).map(r => `${r.item.name} (₹${r.item.price}, Category: ${r.item.category}, Spice: ${r.item.spiceLevel}/3, Score: ${r.score}%)`);

    const messagesPayload = [
      {
        role: "system",
        content: `You are Chef AI (Personal Food Butler) at Patel's Kitchen.
        Your tone is elegant, helpful, and highly hospitable.
        Current customer profile parsed in background:
        - Diet Type: ${liveProfile.diet_type}
        - Spice: ${liveProfile.spice_preference}
        - Allergies: ${liveProfile.allergies.join(", ") || "None"}
        - Budget: ₹${liveProfile.budget_range}
        - Group size: ${liveProfile.group_size}
        
        Symmetrical Menu scoring matches for this guest:
        ${topSuggestions.join("\n")}
        
        Guidance:
        - Politely suggest the top scored matches above and respect their allergies.
        - Present pairings, menu breakdowns, or multiple suggestions using clean points (- item) or neat markdown tables (| Head | Head |) when helpful.
        - Use bolding (**word**) strategically to emphasize items.
        - Keep responses clean, structured, and elegant under 150 words.`
      },
      ...messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? "user" : "assistant",
        content: m.text
      })),
      {
        role: "user",
        content: userText
      }
    ];

    const response = await fetch('/api/chef-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        messages: messagesPayload
      })
    });

    if (!response.ok) {
      throw new Error(`Chef AI HTTP ${response.status}`);
    }

    const data = await response.json();
    const replyText = data.content;

    const listResponse = buildMenuListResponse(userText, menuData, liveProfile);

    let suggestedItem = null;
    let suggestedItems = [];
    const lower = userText.toLowerCase();

    if (!listResponse?.menuTable) {
      if (lower.includes('biryani') || lower.includes('mutton')) {
        suggestedItem = findDish('hyd-chicken-dum-biryani');
      } else if (lower.includes('dosa') || lower.includes('breakfast')) {
        suggestedItem = findDish('ghee-roast-dosa');
      } else if (lower.includes('sweet') || lower.includes('gulab') || lower.includes('dessert')) {
        suggestedItems = menuData.filter(item => item.id === 'gulab-jamun' || item.id === 'filter-coffee');
      }
    }

    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'assistant',
        text: listResponse?.text || replyText,
        menuTable: listResponse?.menuTable || null,
        suggestedItem: listResponse?.menuTable ? null : suggestedItem,
        suggestedItems: listResponse?.menuTable ? null : (suggestedItems.length > 0 ? suggestedItems : null)
      }
    ]);

    triggerChimeSound();
  };

  // High-Fidelity Local Backup Simulator
  const simulateConciergeLogic = (text, liveProfile = profile) => {
    setIsTyping(false);
    const query = text.toLowerCase();
    const listResponse = buildMenuListResponse(text, menuData, liveProfile);

    if (listResponse) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'assistant',
          text: listResponse.text,
          menuTable: listResponse.menuTable
        }
      ]);
      triggerChimeSound();
      return;
    }

    const recommendedList = getRecommendationScores(liveProfile);
    const topMatch = recommendedList[0]?.item;
    
    let reply = '';
    let suggestedItem = null;
    let suggestedItems = [];

    if (query.includes('protein') || query.includes('workout') || query.includes('gym')) {
      reply = "Pranam! For your high-protein workout targets, I highly suggest our roasted Paneer Tikka or our deep-fried Chicken 65. May I add these protein-dense dishes to your plate?";
      suggestedItem = findDish('paneer-tikka');
    } else if (query.includes('diet') || query.includes('healthy') || query.includes('weight loss')) {
      reply = "For healthy dining and weight goals, our steamed Idli Sambar is oil-free and loaded with high-fiber lentils. Shall I add a plate of Idli Sambar to your plate?";
      suggestedItem = findDish('idli-sambar');
    } else if (query.includes('sweet') || query.includes('dessert')) {
      reply = "A royal Patel feast is never complete without a sweet conclusion. I suggest our syrup-soaked Gulab Jamuns paired with Madras Filter Coffee. May I add this sweet pair?";
      suggestedItems = menuData.filter(i => i.id === 'gulab-jamun' || i.id === 'filter-coffee');
    } else {
      if (topMatch) {
        reply = `Based on your preferences, I highly recommend our signature ${topMatch.name}. It represents an excellent matching score (${recommendedList[0].score}%). Shall I add it to your plate?`;
        suggestedItem = topMatch;
      } else {
        reply = "Pranam! I suggest trying our crispy, golden Ghee Roast Dosa alongside frothed Filter Coffee. May I add these to your plate?";
        suggestedItem = findDish('ghee-roast-dosa');
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'assistant',
        text: reply,
        suggestedItem,
        suggestedItems: suggestedItems.length > 0 ? suggestedItems : null
      }
    ]);

    triggerChimeSound();
  };

  const triggerChimeSound = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.012, audioCtx.currentTime);
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

  const handleAddSuggested = (item) => {
    onAddToPlate(item);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'assistant',
        text: `Splendid choice! I have placed ${item.name} onto your plate. It will be prepared fresh.`
      }
    ]);
  };

  const handleAddMultiple = (items) => {
    items.forEach(item => onAddToPlate(item));
    const names = items.map(i => i.name).join(' & ');
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'assistant',
        text: `Wonderful! I have added ${names} to your feasting plate. A perfect match!`
      }
    ]);
  };

  const handleClearChat = useCallback(() => {
    setMessages([{ ...WELCOME_MESSAGE, id: Date.now() }]);
    setProfile({ ...DEFAULT_PROFILE });
    setInputText('');
    try {
      sessionStorage.removeItem('pk_chef_ai_history');
      sessionStorage.removeItem('pk_chef_ai_profile');
    } catch (e) {
      console.error('Error clearing Chef AI session', e);
    }
  }, []);

  return (
    <div className="ai-assistant-container">
      
      {/* Floating Circular Turban Badge Trigger */}
      {!isOpen && (
        <button 
          className="ai-badge-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Open Chef AI"
        >
          <img src={logoImg} alt="AI Chef" className="ai-avatar-logo" />
        </button>
      )}

      {/* Expanded Sized Minimalist Chat Panel */}
      {isOpen && (
        <div className="ai-panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="Chef AI assistant">
          
          {/* Header (No Settings gear, Named Chef AI) */}
          <div className="ai-panel-header">
            <div className="ai-panel-title-group">
              <img 
                src={logoImg} 
                alt="Chef" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--royal-gold)' }} 
              />
              <div>
                <h4 className="ai-khansama-title">Chef AI</h4>
              </div>
            </div>

            <div className="ai-panel-header-actions">
              <button
                type="button"
                className="btn-ai-delete"
                onClick={handleClearChat}
                aria-label="Clear chat"
                title="Clear chat"
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                className="btn-ai-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chef AI"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat History scroll box (Single Clean screen, NO tabs selector) */}
          <div className="ai-chat-history">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                <FormattedText text={msg.text} />

                {msg.menuTable?.items?.length > 0 && (
                  <MenuItemTable
                    title={msg.menuTable.title}
                    items={msg.menuTable.items}
                    onAdd={handleAddSuggested}
                  />
                )}

                {/* Single Item Concierge Card */}
                {msg.suggestedItem && !msg.menuTable && (
                  <div className="rec-card">
                    <img src={msg.suggestedItem.image} alt={msg.suggestedItem.name} />
                    <div className="rec-card-details">
                      <div className="rec-card-name">{msg.suggestedItem.name}</div>
                      <div className="rec-card-price">₹{msg.suggestedItem.price}</div>
                    </div>
                    <button 
                      onClick={() => handleAddSuggested(msg.suggestedItem)}
                      className="btn-bubble-add"
                      title="Add to Plate"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}

                {/* Multiple Pairing Items Concierge Card */}
                {msg.suggestedItems && (
                  <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--traditional-brown)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Recommended Pairing:
                    </div>
                    {msg.suggestedItems.map((item) => (
                      <div key={item.id} className="rec-card" style={{ marginTop: 0 }}>
                        <img src={item.image} alt={item.name} />
                        <div className="rec-card-details">
                          <div className="rec-card-name">{item.name}</div>
                          <div className="rec-card-price">₹{item.price}</div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddMultiple(msg.suggestedItems)}
                      className="btn-primary"
                      style={{
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        borderRadius: '12px',
                        width: '100%'
                      }}
                    >
                      Add Combo to Plate
                    </button>
                  </div>
                )}

              </div>
            ))}

            {/* Simulated typing indicator */}
            {isTyping && (
              <div className="ai-typing-indicator">
                <div className="ai-typing-dot" />
                <div className="ai-typing-dot" />
                <div className="ai-typing-dot" />
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Footer controls */}
          <div className="ai-panel-footer">
            
            {/* Prompt Chips */}
            <div className="ai-prompt-chips">
              {promptChips.map((chip) => (
                <button
                  key={chip.label}
                  className="prompt-chip"
                  onClick={() => handleSend(chip.query)}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Text input with character limits & cap trackers */}
            <div className="ai-input-wrapper" style={{ opacity: dailyMessageCount >= 30 ? 0.6 : 1 }}>
              <input
                type="text"
                className="ai-input"
                maxLength={250}
                disabled={dailyMessageCount >= 30}
                placeholder={dailyMessageCount >= 30 
                  ? "Daily limit of 30 messages reached." 
                  : "Ask Chef AI (e.g. Biryani, spicy, low oil, etc.)..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleSend(inputText);
                  }
                }}
              />
              <span className={`ai-char-count${inputText.length >= 235 ? ' is-near-limit' : ''}`}>
                {inputText.length}/250
              </span>
              <button 
                className="btn-ai-send"
                onClick={() => handleSend(inputText)}
                disabled={dailyMessageCount >= 30}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>


          </div>

        </div>
      )}

    </div>
  );
}
