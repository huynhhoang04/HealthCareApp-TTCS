import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddNutrition() {
    const navigate = useNavigate();
    const [foods, setFoods] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, foodData: null });
    
    const [formData, setFormData] = useState({ meal_type: 'Sáng', weight_in_grams: '', custom_food_name: '', custom_calories: '' });

    useEffect(() => {
        fetchFoods('');
    }, []);

    const fetchFoods = async (query) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get(`http://127.0.0.1:8000/api/v1/dashboard/food/search/?q=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFoods(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        fetchFoods(query);
    };

    const openModal = (type, food = null) => {
        setModalConfig({ isOpen: true, type, foodData: food });
        setFormData({ meal_type: 'Sáng', weight_in_grams: '', custom_food_name: '', custom_calories: '' });
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('access_token');
            let payload = { meal_type: formData.meal_type };

            if (modalConfig.type === 'system') {
                payload.food_item = modalConfig.foodData.id;
                payload.weight_in_grams = parseFloat(formData.weight_in_grams);
            } else {
                payload.custom_food_name = formData.custom_food_name;
                payload.custom_calories = parseFloat(formData.custom_calories);
            }

            await axios.post('http://127.0.0.1:8000/api/v1/dashboard/nutrition/log/create/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            navigate('/dashboard'); 
        } catch (error) {
            alert("Vui lòng điền đầy đủ thông tin hợp lệ!");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 min-h-screen shadow-lg relative flex flex-col">
                
                <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm p-4 flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="w-10 h-10 bg-slate-100 dark:bg-gray-700 rounded-full flex justify-center items-center font-bold text-gray-600 dark:text-gray-300">
                        ←
                    </button>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white">Thêm bữa ăn</h1>
                </header>

                <div className="p-5">
                    <input 
                        type="text" 
                        placeholder="Tìm món ăn..." 
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full p-3 bg-slate-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                    />

                    <button 
                        onClick={() => openModal('custom')}
                        className="w-full p-4 border-2 border-dashed border-orange-300 dark:border-orange-700 text-orange-500 dark:text-orange-400 font-bold rounded-2xl mb-6 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                    >
                        + Tự nhập món ăn ngoài
                    </button>

                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase">Gợi ý cho bạn</h2>
                    <div className="space-y-3">
                        {foods.map(food => (
                            <div 
                                key={food.id} 
                                onClick={() => openModal('system', food)}
                                className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl shadow-sm cursor-pointer hover:border-emerald-500"
                            >
                                <div className="flex items-center gap-3">
                                    {food.image ? (
                                        <img src={food.image} alt={food.name} className="w-12 h-12 rounded-xl object-cover bg-slate-50 dark:bg-gray-700" />
                                    ) : (
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl">𓌉◯𓇋</div>
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{food.name}</p>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">{food.calories} kcal/100g</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {modalConfig.isOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                {modalConfig.type === 'system' ? modalConfig.foodData.name : 'Tự nhập món'}
                            </h2>
                            
                            <select 
                                value={formData.meal_type}
                                onChange={(e) => setFormData({...formData, meal_type: e.target.value})}
                                className="w-full p-3 bg-slate-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-xl mb-3 outline-none"
                            >
                                <option value="Sáng">Bữa Sáng</option>
                                <option value="Trưa">Bữa Trưa</option>
                                <option value="Chiều">Bữa Chiều</option>
                                <option value="Tối">Bữa Tối</option>
                                <option value="Phụ">Bữa Phụ</option>
                            </select>

                            {modalConfig.type === 'system' ? (
                                <input 
                                    type="number" 
                                    placeholder="Trọng lượng (gram)" 
                                    value={formData.weight_in_grams}
                                    onChange={(e) => setFormData({...formData, weight_in_grams: e.target.value})}
                                    className="w-full p-3 bg-slate-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-xl mb-4 outline-none"
                                />
                            ) : (
                                <>
                                    <input 
                                        type="text" 
                                        placeholder="Tên món ăn" 
                                        value={formData.custom_food_name}
                                        onChange={(e) => setFormData({...formData, custom_food_name: e.target.value})}
                                        className="w-full p-3 bg-slate-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-xl mb-3 outline-none"
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Tổng Calo (kcal)" 
                                        value={formData.custom_calories}
                                        onChange={(e) => setFormData({...formData, custom_calories: e.target.value})}
                                        className="w-full p-3 bg-slate-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-xl mb-4 outline-none"
                                    />
                                </>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setModalConfig({isOpen: false})} className="flex-1 p-3 bg-slate-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl">Hủy</button>
                                <button onClick={handleSubmit} className="flex-1 p-3 bg-emerald-600 dark:bg-emerald-600 text-white font-bold rounded-xl">Lưu</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}