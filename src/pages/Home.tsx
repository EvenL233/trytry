
import React, { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  salary: 10000,
  salaryType: 'monthly',
  workStartTime: '09:00',
  workEndTime: '18:00',
  currency: '¥'
};

export default function Home() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [workProgress, setWorkProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('salarySettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('salarySettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const calculateEarningsPerSecond = () => {
    const { salary, salaryType, workStartTime, workEndTime } = settings;
    
    let monthlySalary = salary;
    if (salaryType === 'yearly') {
      monthlySalary = salary / 12;
    }
    
    const [startHour, startMin] = workStartTime.split(':').map(Number);
    const [endHour, endMin] = workEndTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;
    const workMinutes = endTotalMinutes - startTotalMinutes;
    
    const workSecondsPerMonth = workMinutes * 60 * 22;
    
    if (workSecondsPerMonth <= 0) {
      return 0;
    }
    
    return monthlySalary / workSecondsPerMonth;
  };

  const updateEarnings = () => {
    const { workStartTime, workEndTime } = settings;
    const now = new Date();
    const [startHour, startMin] = workStartTime.split(':').map(Number);
    const [endHour, endMin] = workEndTime.split(':').map(Number);
    
    const startTime = new Date(now);
    startTime.setHours(startHour, startMin, 0, 0);
    
    const endTime = new Date(now);
    endTime.setHours(endHour, endMin, 0, 0);
    
    const totalWorkMs = endTime.getTime() - startTime.getTime();
    const elapsedMs = Math.max(0, now.getTime() - startTime.getTime());
    
    const progress = totalWorkMs > 0 ? Math.min(100, (elapsedMs / totalWorkMs) * 100) : 0;
    setWorkProgress(progress);
    
    const earningsPerSecond = calculateEarningsPerSecond();
    const elapsedSeconds = elapsedMs / 1000;
    const earnings = elapsedSeconds * earningsPerSecond;
    
    setCurrentEarnings(earnings);
  };

  useEffect(() => {
    updateEarnings();
    const interval = setInterval(updateEarnings, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [settings]);

  const formatCurrency = (amount) => {
    return settings.currency + amount.toFixed(2);
  };

  const getMotivationalMessage = () => {
    const messages = [
      '太棒了！继续加油！🎉',
      '每一秒都在赚钱！💰',
      '工作使我快乐！✨',
      '离财富自由更近一步！🚀',
      '今日收获满满！🌟',
      '努力工作，未来可期！💪',
      '加油，你是最棒的！👍'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-6 transform hover:scale-[1.02] transition-all duration-500">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
            🎉 今日收入计算器
          </h1>

          <div className="text-center mb-8">
            <div className="text-8xl font-black bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent animate-pulse">
              {formatCurrency(currentEarnings)}
            </div>
            <p className="text-gray-500 mt-2 text-lg">今日已赚 🤑</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 font-medium">工作进度</span>
              <span className="text-purple-600 font-bold">{workProgress.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 rounded-full"
                style={{ width: `${workProgress}%` }}
              />
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl mb-6">
            <p className="text-xl font-semibold text-gray-700">
              {getMotivationalMessage()}
            </p>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
          >
            {showSettings ? '收起设置 ⬆️' : '设置薪资信息 ⚙️'}
          </button>
        </div>

        {showSettings && (
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              薪资设置 💼
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  薪资金额
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={settings.salary}
                    onChange={(e) => setSettings({ ...settings, salary: Number(e.target.value) })}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all text-lg"
                    placeholder="输入金额"
                  />
                  <select
                    value={settings.salaryType}
                    onChange={(e) => setSettings({ ...settings, salaryType: e.target.value })}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all text-lg"
                  >
                    <option value="monthly">月薪</option>
                    <option value="yearly">年薪</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    上班时间 🌅
                  </label>
                  <input
                    type="time"
                    value={settings.workStartTime}
                    onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all text-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    下班时间 🌇
                  </label>
                  <input
                    type="time"
                    value={settings.workEndTime}
                    onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  货币符号
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all text-lg"
                >
                  <option value="¥">¥ 人民币</option>
                  <option value="$">$ 美元</option>
                  <option value="€">€ 欧元</option>
                  <option value="£">£ 英镑</option>
                </select>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl text-blue-700 text-sm">
                💡 提示：计算基于每月工作22天，设置会自动保存哦！
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
