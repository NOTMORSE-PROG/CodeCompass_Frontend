/**
 * AI Chat page — real-time Taglish conversation with CodeCompass AI.
 * WebSocket streaming via Django Channels.
 */
import { useState, useEffect, useRef } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import useChatStore from '../../stores/chatStore'
import useAuthStore from '../../stores/authStore'

const SUGGESTED_PROMPTS = [
  'Ano ang magandang career path para sa CS graduate sa Pilipinas?',
  'Paano ako magiging fullstack developer?',
  'Anong certifications ang dapat ko kunin bilang fresh graduate?',
  'Magkano ang sweldo ng software engineer sa Philippines?',
]

export default function AIChatPage() {
  const { user } = useAuthStore()
  const { currentSession, messages, streamingContent, isStreaming, createSession, selectSession, sendMessage } = useChatStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Create a new session if none exists
    if (!currentSession) {
      createSession('general').then((session) => {
        if (session) selectSession(session.sessionId)
      })
    }
  }, [currentSession, createSession, selectSession])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-brand-black">CodeCompass AI</h1>
        <p className="text-brand-gray-mid text-sm">
          Magtanong sa Taglish, English, o Filipino — sagot sa loob ng ilang segundo!
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 p-4 space-y-4 mb-4">
        {/* Welcome message */}
        {messages.length === 0 && !isStreaming && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-bold text-brand-black mb-1">Kumusta! Ako si CodeCompass AI</h3>
            <p className="text-brand-gray-mid text-sm max-w-sm mx-auto">
              Career mentor mo para sa IT sa Pilipinas. Tanungin mo ako tungkol sa career paths,
              certifications, o kung saan ka mag-aaral!
            </p>

            {/* Suggested prompts */}
            <div className="mt-6 space-y-2 max-w-lg mx-auto">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); }}
                  className="w-full text-left px-4 py-2.5 rounded-lg border border-brand-yellow/30 bg-brand-yellow-pale
                             text-brand-black text-sm hover:bg-brand-yellow hover:border-brand-yellow
                             transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-brand-black font-bold text-xs">AI</span>
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-brand-yellow text-brand-black rounded-br-sm'
                : 'bg-gray-100 text-brand-black rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-brand-black flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                <span className="text-brand-yellow font-bold text-xs">
                  {user?.fullName?.[0] || 'U'}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Streaming response */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center mr-2 flex-shrink-0 mt-1">
              <span className="text-brand-black font-bold text-xs">AI</span>
            </div>
            <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 text-brand-black text-sm leading-relaxed">
              {streamingContent}
              <span className="inline-block w-1.5 h-4 bg-brand-yellow ml-0.5 animate-pulse" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Magtanong sa Taglish o English... (Enter para ipadala)"
          rows={2}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-brand-black
                     placeholder:text-brand-gray-mid resize-none
                     focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent
                     disabled:opacity-50 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="bg-brand-yellow text-brand-black p-3 rounded-xl hover:bg-brand-yellow-dark
                     active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed
                     flex-shrink-0 self-end"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
