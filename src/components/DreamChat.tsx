import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Dream, ChatMessage } from '../lib/types';

interface DreamChatProps {
  dream: Dream;
  onClose?: () => void;
}

export function DreamChat({ dream, onClose }: DreamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [pastDreams, setPastDreams] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // messagesEndRef removed to prevent scrollIntoView jumping

  // Fetch initial chat history and past 10 dreams
  useEffect(() => {
    async function loadData() {
      // 1. Fetch past dreams (last 10)
      const { data: dreamsData } = await supabase
        .from('dreams')
        .select('dream_text')
        .eq('user_id', dream.user_id)
        .neq('id', dream.id) // exclude current
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (dreamsData) {
        setPastDreams(dreamsData.map(d => d.dream_text));
      }

      // 2. Fetch existing chat for this dream
      const { data: chatData, error } = await supabase
        .from('dream_chats')
        .select('id, messages')
        .eq('dream_id', dream.id)
        .maybeSingle();

      if (chatData) {
        setChatId(chatData.id);
        setMessages(chatData.messages || []);
      }
    }
    loadData();
  }, [dream.id, dream.user_id]);

  // Auto-scroll to bottom of messages without jumping the whole page
  useEffect(() => {
    if (scrollContainerRef.current && messages.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, presetMessage?: string) => {
    if (e) e.preventDefault();
    
    const messageText = presetMessage || inputValue;
    if (!messageText.trim() || isLoading) return;

    setInputValue('');
    setIsLoading(true);

    const newUserMessage: ChatMessage = {
      role: 'user',
      content: messageText.trim(),
      created_at: new Date().toISOString()
    };

    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);

    try {
      // 1. Call Netlify function
      const response = await fetch('/.netlify/functions/dream-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamText: dream.dream_text,
          interpretation: dream.interpretation,
          pastDreams: pastDreams,
          chatHistory: messages, // Send history WITHOUT the new message (it's added server-side)
          newMessage: newUserMessage.content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        role: 'ai',
        content: data.reply,
        created_at: new Date().toISOString()
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      // 2. Save to Supabase
      if (chatId) {
        await supabase
          .from('dream_chats')
          .update({
            messages: finalMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', chatId);
      } else {
        const { data: insertData, error } = await supabase
          .from('dream_chats')
          .insert({
            dream_id: dream.id,
            user_id: dream.user_id,
            messages: finalMessages
          })
          .select('id')
          .single();
          
        if (insertData) setChatId(insertData.id);
      }

    } catch (err) {
      console.error(err);
      // Rollback optimistic update on error
      setMessages(messages);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract a symbol or theme for starter chips
  const sampleSymbol = dream.interpretation?.symbols?.[0]?.symbol || "symbol";
  const sampleTheme = dream.interpretation?.mainThemes?.[0]?.replace(/[^\w\s]/gi, '').trim() || "theme";

  return (
    <div className="dream-chat-container">
      <div className="dream-chat-header">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3>Chat with your Dream</h3>
        {onClose && (
          <button onClick={onClose} className="chat-close-btn" aria-label="Close chat">×</button>
        )}
      </div>

      <div className="dream-chat-messages" ref={scrollContainerRef}>
        {messages.length === 0 ? (
          <div className="dream-chat-empty">
            <p>Ask a question about your dream or explore its meaning deeper.</p>
            <div className="chat-starter-chips">
              <button onClick={() => handleSend(undefined, `Can you dig deeper into the ${sampleSymbol}?`)}>
                Explore {sampleSymbol}
              </button>
              <button onClick={() => handleSend(undefined, `Why is the theme of ${sampleTheme} showing up?`)}>
                Discuss {sampleTheme}
              </button>
              <button onClick={() => handleSend(undefined, "What should I take away from this emotionally?")}>
                Emotional meaning
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role === 'ai' ? 'chat-ai' : 'chat-user'}`}>
              <div className="chat-bubble">
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="chat-message chat-ai">
            <div className="chat-bubble chat-loading">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="dream-chat-input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask your dream guide..."
          disabled={isLoading}
          className="chat-input"
        />
        <button type="submit" disabled={!inputValue.trim() || isLoading} className="chat-send-btn">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
