import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Chat() {
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Chào bạn! Mình là trợ lý sức khỏe AI. Mình có thể giúp gì cho mục tiêu tập luyện và dinh dưỡng của bạn hôm nay?' }
    ]);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post('http://127.0.0.1:8000/api/v1/ai/chat/casual/', {
                messages: newMessages 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const aiMessage = res.data.message;
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, hệ thống AI đang bận. Bạn vui lòng thử lại sau nhé!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 min-h-screen shadow-lg relative flex flex-col transition-colors duration-300">
                
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm p-4 flex items-center gap-4 transition-colors">
                    <button onClick={() => navigate('/dashboard')} className="w-10 h-10 bg-slate-100 dark:bg-gray-700 rounded-full flex justify-center items-center font-bold text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600 transition">
                        ←
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 dark:text-white">Trợ lý AI</h1>
                        <p className="text-xs text-emerald-500 font-semibold">● Đang hoạt động</p>
                    </div>
                </header>

                {/* Khung Chat */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 pb-24 scrollbar-hide">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div 
                                className={`max-w-[80%] p-3 rounded-2xl ${
                                    msg.role === 'user' 
                                    ? 'bg-emerald-600 text-white rounded-tr-sm' 
                                    : 'bg-slate-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-sm shadow-sm transition-colors'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    
                    {/* Hiệu ứng AI đang gõ */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-3 rounded-2xl rounded-tl-sm text-sm flex gap-1 items-center shadow-sm transition-colors">
                                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Ô nhập tin nhắn cố định ở đáy */}
                <div className="absolute bottom-0 w-full bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 flex gap-2 items-end transition-colors">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Hỏi AI về mục tiêu của bạn..." 
                        className="flex-1 bg-slate-100 dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400 rounded-2xl p-3 max-h-32 min-h-[50px] outline-none resize-none text-sm transition-colors"
                        rows="1"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="w-12 h-12 flex-shrink-0 bg-emerald-600 dark:bg-emerald-500 rounded-full flex justify-center items-center text-white disabled:bg-slate-300 dark:disabled:bg-gray-600 transition-colors shadow-md"
                    >
                        ➤
                    </button>
                </div>

            </div>
        </div>
    );
}