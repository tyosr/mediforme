"use client";
import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const BASE_URL = "https://chatbot-backend-ya6w.onrender.com";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '📂 Veuillez charger votre calendrier de rendez-vous (.xlsx).', image: null }
  ]);
  const [input, setInput] = useState('');
  const [reminders, setReminders] = useState([]);
  const [seenReminders, setSeenReminders] = useState([]);
  const [playedReminders, setPlayedReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkServerStatus();
    const statusInterval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(statusInterval);
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Erreur audio:', err));
    } catch (err) {
      console.log('Erreur audio:', err);
    }
  };

  const checkServerStatus = () => {
    fetch(`${BASE_URL}/check_reminders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    })
      .then(res => {
        if (res.ok) {
          setServerError(false);
          return res.json();
        } else {
          throw new Error('Serveur non disponible');
        }
      })
      .then(data => {
        if (data.reminders?.length > 0) {
          const newReminders = data.reminders.filter(
            reminder => !seenReminders.includes(reminder.rdv_id)
          );
          if (newReminders.length > 0) {
            setReminders(newReminders);
            const reminderIds = newReminders.map(reminder => reminder.rdv_id);
            const unplayedReminders = reminderIds.filter(id => !playedReminders.includes(id));
            if (unplayedReminders.length > 0) {
              playNotificationSound();
              setPlayedReminders(prev => [...prev, ...unplayedReminders]);
            }
          }
        }
      })
      .catch(err => {
        console.error('Erreur de connexion au serveur:', err);
        setServerError(true);
      });
  };

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { sender: 'user', text: input, image: null }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
      signal: AbortSignal.timeout(10000)
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setServerError(false);
        let botMessages = [];

        const parseResponse = (responseText) => {
          const images = [];
          const imageMatches = responseText.matchAll(/!\[.*?\]\((.*?)\)/g);
          for (const match of imageMatches) {
            images.push(match[1]);
            responseText = responseText.replace(match[0], '');
          }
          return { text: responseText, images: images.length > 0 ? images : null };
        };

        if (Array.isArray(data.response)) {
          botMessages = data.response.map(resp => ({ sender: 'bot', ...parseResponse(resp) }));
        } else {
          botMessages = [{ sender: 'bot', ...parseResponse(data.response) }];
        }

        if (botMessages.some(msg => msg.text.includes("(Son doux type Facebook activé)"))) {
          playNotificationSound();
        }

        setMessages([...newMessages, ...botMessages]);

        botMessages.forEach(msg => {
          if (msg.text.includes("PDF exporté : rdv_confirmes.pdf")) {
            setTimeout(() => {
              const link = document.createElement('a');
              link.href = `${BASE_URL}/download_pdf_rdv`;
              link.download = 'rdv_confirmes.pdf';
              link.click();
            }, 500);
          }

          if (msg.text.includes("Calendrier mis à jour exporté : calendrier_mis_a_jour.xlsx")) {
            setTimeout(() => {
              const excelLink = document.createElement('a');
              excelLink.href = `${BASE_URL}/download_updated_calendar`;
              excelLink.download = 'calendrier_mis_a_jour.xlsx';
              excelLink.click();
            }, 800);
          }
        });
      })
      .catch(err => {
        console.error('Erreur communication:', err);
        setServerError(true);
        setMessages([...newMessages, {
          sender: 'bot',
          text: '❌ Erreur de communication avec le serveur.',
          image: null
        }]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    fetch(`${BASE_URL}/upload_calendar`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(15000)
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setServerError(false);
        setMessages([...messages, { sender: 'bot', text: data.response, image: null }]);
      })
      .catch(err => {
        console.error('Erreur upload:', err);
        setServerError(true);
        setMessages([...messages, {
          sender: 'bot',
          text: '❌ Erreur lors de l\'upload du fichier.',
          image: null
        }]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const reconnectServer = () => {
    setServerError(false);
    checkServerStatus();
  };


  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Ouvrir le chatbot"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </button>
      ) : (
        <div className="w-96 md:w-[450px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col font-sans">
          <div className="bg-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">
            <span className="text-lg font-semibold">Chatbot Médical</span>
            <button
              className="text-white text-lg font-bold hover:text-gray-200 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le chatbot"
            >
              ✕
            </button>
          </div>

          {/* Bannière d'erreur de serveur */}
          {serverError && (
            <div className="bg-red-500 text-white text-sm p-2 flex justify-between items-center">
              <span>⚠️ Problème de connexion au serveur</span>
              <button 
                onClick={reconnectServer}
                className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
              >
                Reconnecter
              </button>
            </div>
          )}

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 px-4 py-2 rounded-2xl max-w-[90%] break-words ${
                  msg.sender === 'bot'
                    ? 'bg-blue-500 text-white self-start'
                    : 'bg-gray-200 text-gray-800 self-end ml-auto'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                {msg.images && msg.images.map((image, idx) => (
                  <img key={idx} src={image} alt="Statistiques" className="mt-2 max-w-full rounded-lg" />
                ))}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl self-start mb-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="mb-3 w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-600 hover:file:bg-blue-200 disabled:opacity-50"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                placeholder={isLoading ? "Traitement en cours..." : "Saisissez d'abord le calendrier..."}
                className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-800 placeholder-gray-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className={`p-2 ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-full transition-colors`}
              >
                {isLoading ? "..." : "➤"}
              </button>
            </div>
          </div>

          {reminders.length > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-200 p-5 rounded-xl shadow-lg text-center">
              {reminders.map((reminder, index) => (
                <div key={index}>
                  <p className="text-gray-800 mb-2">
                    🔔 À {reminder.rappel_time} → Rappel pour {reminder.rdv_id} prévu à {reminder.time}
                  </p>
                </div>
              ))}
              <button
                onClick={() => {
                  const currentReminderIds = reminders.map(reminder => reminder.rdv_id);
                  setSeenReminders(prev => [...prev, ...currentReminderIds]);
                  setReminders([]);
                }}
                className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;