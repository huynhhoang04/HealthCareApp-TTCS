import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddWorkout() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchExercises();
    }, [searchQuery, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('http://127.0.0.1:8000/api/v1/dashboard/workout/categories/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchExercises = async () => {
        try {
            const token = localStorage.getItem('access_token');
            let url = `http://127.0.0.1:8000/api/v1/dashboard/workout/exercises/?q=${searchQuery}`;
            if (selectedCategory) {
                url += `&category_id=${selectedCategory}`;
            }
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExercises(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleExerciseClick = (id) => {
        // Điều hướng sang trang chi tiết tập luyện (chưa có)
        navigate(`/workout-detail/${id}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 min-h-screen shadow-lg relative flex flex-col">
                
                <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm p-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="w-10 h-10 bg-slate-100 dark:bg-gray-700 rounded-full flex justify-center items-center font-bold text-gray-600 dark:text-gray-300">
                        ←
                    </button>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white">Thêm bài tập</h1>
                </header>

                <div className="p-5">
                    <input 
                        type="text" 
                        placeholder="Tìm bài tập..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 bg-slate-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    />

                    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                        <button 
                            onClick={() => setSelectedCategory('')}
                            className={`px-4 py-2 whitespace-nowrap rounded-full font-bold text-sm ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        >
                            Tất cả
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 whitespace-nowrap rounded-full font-bold text-sm ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        {exercises.map(ex => (
                            <div 
                                key={ex.id} 
                                onClick={() => handleExerciseClick(ex.id)}
                                className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl shadow-sm cursor-pointer hover:border-blue-500"
                            >
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white">{ex.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Nhóm cơ: {ex.muscle_group}</p>
                                </div>
                                <span onClick={() => navigate('/workout-detail/' + ex.id)} className="text-blue-600 dark:text-blue-400 font-bold text-xl">→</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}