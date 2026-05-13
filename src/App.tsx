import React, { useState, useEffect } from 'react';
import CoinRain from './components/CoinRain';

const DEFAULT_SETTINGS = {
  salary: 10000,
  salaryType: 'monthly',
  workStartTime: '09:00',
  workEndTime: '18:00',
  lunchBreakStart: '12:00',
  lunchBreakEnd: '13:00',
  dinnerBreakStart: '',
  dinnerBreakEnd: '',
  currency: '¥'
};

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [workProgress, setWorkProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakType, setBreakType] = useState('');
  const [salaryInput, setSalaryInput] = useState(DEFAULT_SETTINGS.salary.toString());
  const [workDaysInfo, setWorkDaysInfo] = useState({ passed: 0, total: 22 });
  const [currentMessage, setCurrentMessage] = useState('');

  // 励志文案
  const getMotivationalMessage = () => {
    const messages = [
      '(ง •̀_•́)ง 干啥都可以佛系，唯独搞钱要尽力！',
      '╭(╯^╰)╮ 每一秒都在变有钱！',
      '(๑•̀ㅂ•́)و✧ 你们花钱，我赚钱！',
      '生而俗人，喜欢金钱和感动！(๑°o°๑)',
      '只有成年人才能体会赚钱的快乐！(´∇｀)',
      '钱不是万能的，但没钱是万万不能的！(╬▔皿▔)╯',
      '工作是换钱的工具，绝不让内耗消耗自己！(ノ｀Д)ノ',
      '副业不求暴富，只求悄悄增收！╮(╯▽╰)╭',
      '每一分努力，都在为未来铺路！✧٩(ˊωˋ*)و✧',
      '今日份搬砖，明日当老板！٩(๑❛ᴗ❛๑)۶',
      '打工是为了不再打工！(๑•̀ㅂ•́)و',
      '赚钱是成年人最体面的自律！ᕙ(⇀‸↼‶)ᕗ',
      '别在应该赚钱的年纪选择安逸！(╬ﾟдﾟ)',
      '你现在的努力，都在为将来的自己买单！(｡♥‿♥｡)',
      '加油，搞钱人！暴富指日可待！ᕙ(`皿´)ᕗ',
      '生活不是为了钱，但生活需要钱！(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥`)',
      '每一秒都在创造价值！(๑•̀ㅂ•́)و✧',
      '今天多赚一分钱，明天少说一句求人的话！(ノへ￣、)',
      '越努力越幸运，越幸运越有钱！٩(♡ε♡)۶',
      '打工人，打工魂，打工都是人上人！ᕦ(ò_óˇ)ᕤ'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getBreakMessage = () => {
    const messages = [
      '好好休息，才能更好地工作！(｡･ω･｡)ﾉ♡',
      '休息一下，效率翻倍！(๑•̀ㅂ•́)و✧',
      '充电完毕，满血复活！╰(*°▽°*)╯',
      '短暂休息，继续战斗！(ง •̀_•́)ง',
      '休息是为了走更远的路！(๑•̀ㅂ•́)و'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // 薪资输入同步
  useEffect(() => {
    setSalaryInput(settings.salary.toString());
  }, [settings.salary]);

  // 初始文案
  useEffect(() => {
    setCurrentMessage(getMotivationalMessage());
  }, []);

  // 读取本地存储
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

  // 保存本地存储
  useEffect(() => {
    try {
      localStorage.setItem('salarySettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // 工具：时间转当天时间戳
  const getDayTimeStamp = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    return d.getTime();
  };

  // 计算当日纯工作分钟
  const calculateTotalWorkMinutes = () => {
    const { workStartTime, workEndTime, lunchBreakStart, lunchBreakEnd, dinnerBreakStart, dinnerBreakEnd } = settings;
    const start = getDayTimeStamp(workStartTime);
    const end = getDayTimeStamp(workEndTime);
    let total = (end - start) / 60000;

    if (lunchBreakStart && lunchBreakEnd) {
      const lStart = getDayTimeStamp(lunchBreakStart);
      const lEnd = getDayTimeStamp(lunchBreakEnd);
      total -= (lEnd - lStart) / 60000;
    }
    if (dinnerBreakStart && dinnerBreakEnd) {
      const dStart = getDayTimeStamp(dinnerBreakStart);
      const dEnd = getDayTimeStamp(dinnerBreakEnd);
      total -= (dEnd - dStart) / 60000;
    }
    return Math.max(0, total);
  };

  // 每秒收益
  const calculateEarningsPerSecond = () => {
    const { salary, salaryType } = settings;
    let monthlySalary = salaryType === 'yearly' ? salary / 12 : salary;
    const workMin = calculateTotalWorkMinutes();
    const monthSec = workMin * 60 * 22;
    return monthSec <= 0 ? 0 : monthlySalary / monthSec;
  };

  // 当月工作日总数
  const calculateWorkDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let workDays = 0;
    const last = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      const w = new Date(year, month, d).getDay();
      if (w !== 0 && w !== 6) workDays++;
    }
    return workDays;
  };

  // 当月已过工作日
  const calculatePassedWorkDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    let workDays = 0;
    for (let d = 1; d < day; d++) {
      const w = new Date(year, month, d).getDay();
      if (w !== 0 && w !== 6) workDays++;
    }
    return workDays;
  };

  // 核心更新逻辑（修复卡死版）
  const updateEarnings = () => {
    const nowStamp = Date.now();
    const { workStartTime, workEndTime, lunchBreakStart, lunchBreakEnd, dinnerBreakStart, dinnerBreakEnd } = settings;

    const startStamp = getDayTimeStamp(workStartTime);
    const endStamp = getDayTimeStamp(workEndTime);
    const lStartStamp = getDayTimeStamp(lunchBreakStart);
    const lEndStamp = getDayTimeStamp(lunchBreakEnd);
    const dStartStamp = getDayTimeStamp(dinnerBreakStart);
    const dEndStamp = getDayTimeStamp(dinnerBreakEnd);

    let inBreak = false;
    let label = '';

    // 判断午休
    if (lStartStamp && lEndStamp && nowStamp >= lStartStamp && nowStamp < lEndStamp) {
      inBreak = true;
      label = '🍽️ 午餐休息中...';
    }
    // 判断晚休
    if (!inBreak && dStartStamp && dEndStamp && nowStamp >= dStartStamp && nowStamp < dEndStamp) {
      inBreak = true;
      label = '🍜 晚餐休息中...';
    }

    setIsOnBreak(inBreak);
    setBreakType(label);

    const perSec = calculateEarningsPerSecond();
    const totalWorkMin = calculateTotalWorkMinutes();
    const totalWorkSec = totalWorkMin * 60;

    // 上班前
    if (nowStamp < startStamp) {
      setCurrentEarnings(0);
      setWorkProgress(0);
    } 
    // 下班后
    else if (nowStamp >= endStamp) {
      setCurrentEarnings(totalWorkSec * perSec);
      setWorkProgress(100);
    } 
    // 工作中
    else {
      let passMs = nowStamp - startStamp;
      // 扣除午休时长
      if (lStartStamp && lEndStamp) {
        if (nowStamp >= lEndStamp) {
          passMs -= (lEndStamp - lStartStamp);
        } else if (nowStamp > lStartStamp) {
          passMs = lStartStamp - startStamp;
        }
      }
      // 扣除晚休时长
      if (dStartStamp && dEndStamp) {
        if (nowStamp >= dEndStamp) {
          passMs -= (dEndStamp - dStartStamp);
        } else if (nowStamp > dStartStamp) {
          passMs = dStartStamp - startStamp;
          if (lEndStamp < dStartStamp) {
            passMs -= (lEndStamp - lStartStamp);
          }
        }
      }

      const passSec = passMs / 1000;
      const progress = totalWorkSec > 0 ? Math.min(100, (passSec / totalWorkSec) * 100) : 0;
      setWorkProgress(progress);
      setCurrentEarnings(passSec * perSec);
    }

    // 更新工作日
    const totalWD = calculateWorkDaysInMonth();
    const passWD = calculatePassedWorkDays();
    setWorkDaysInfo({ passed: passWD, total: totalWD });

    // 月收入 用函数式更新，避免卡死
    setMonthlyEarnings(prev => {
      const daySec = calculateTotalWorkMinutes() * 60;
      return passWD * daySec * calculateEarningsPerSecond() + currentEarnings;
    });
  };

  // 帧循环 修复卡死
  useEffect(() => {
    let rafId;
    const loop = () => {
      updateEarnings();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [settings]);

  // 文案轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessage(getMotivationalMessage());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // 格式化货币
  const formatCurrency = (amount) => {
    return settings.currency + amount.toFixed(2);
  };

  // 薪资输入
  const handleSalaryChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setSalaryInput(val);
      if (val) setSettings(p => ({ ...p, salary: Number(val) }));
    }
  };

  const handleSalaryBlur = () => {
    if (!salaryInput) {
      setSalaryInput('0');
      setSettings(p => ({ ...p, salary: 0 }));
    }
  };

  // 渲染UI 完全保留你原来的
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-rose-400 to-pink-400 flex items-center justify-center p-4">
      <CoinRain />
      <div className="w-full max-w-4xl relative z-20">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-8">
            💰 今日收入计算器 💰
          </h1>

          <div className="text-center mb-8">
            <div className={`text-8xl font-black bg-clip-text text-transparent ${
              isOnBreak ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-red-600 to-rose-600'
            }`}>
              {isOnBreak ? '0.00' : formatCurrency(currentEarnings)}
            </div>
            <p className="text-gray-500 mt-2 text-lg">
              {isOnBreak ? breakType : '今日已赚 ٩(♡ε♡)۶'}
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 mb-6 border-2 border-red-200">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
                {formatCurrency(monthlyEarnings)}
              </div>
              <p className="text-gray-600 text-sm">
                本月累计收入 📊✨
              </p>
              <p className="text-gray-500 text-xs mt-1">
                已完成 {workDaysInfo.passed} / {workDaysInfo.total} 个工作日 ᕙ(⇀‸↼‶)ᕗ
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 font-medium">
                {isOnBreak ? '休息中...' : '工作进度'}
              </span>
              <span className="text-red-600 font-bold">
                {isOnBreak ? '休息ing ✨' : `${workProgress.toFixed(1)}%`}
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 rounded-full ${
                  isOnBreak ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
                }`}
                style={{ width: `${isOnBreak ? 0 : workProgress}%` }}
              />
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl mb-6 border-2 border-red-200">
            <p className="text-xl font-semibold text-gray-700">
              {isOnBreak ? getBreakMessage() : currentMessage}
            </p>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-lg rounded-2xl hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-lg"
          >
            {showSettings ? '收起设置 ⬆️' : '⚙️ 设置薪资信息 ⚙️'}
          </button>
        </div>

        {showSettings && (
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              💼 薪资设置 💼
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  薪资金额 ヾ(≧▽≦*)o
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={salaryInput}
                    onChange={handleSalaryChange}
                    onBlur={handleSalaryBlur}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-lg"
                    placeholder="输入金额"
                  />
                  <select
                    value={settings.salaryType}
                    onChange={(e) => setSettings({ ...settings, salaryType: e.target.value })}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-lg"
                  >
                    <option value="monthly">月薪</option>
                    <option value="yearly">年薪</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    🌅 上班时间
                  </label>
                  <input
                    type="time"
                    value={settings.workStartTime}
                    onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    🌇 下班时间
                  </label>
                  <input
                    type="time"
                    value={settings.workEndTime}
                    onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-lg"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">🍽️</span>
                  <label className="text-gray-700 font-medium">
                    午餐休息时间 ✨
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    value={settings.lunchBreakStart}
                    onChange={(e) => setSettings({ ...settings, lunchBreakStart: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-lg"
                    placeholder="开始时间"
                  />
                  <input
                    type="time"
                    value={settings.lunchBreakEnd}
                    onChange={(e) => setSettings({ ...settings, lunchBreakEnd: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-lg"
                    placeholder="结束时间"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">🍜</span>
                  <label className="text-gray-700 font-medium">
                    晚餐休息时间（可选）✨
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    value={settings.dinnerBreakStart}
                    onChange={(e) => setSettings({ ...settings, dinnerBreakStart: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-lg"
                    placeholder="开始时间"
                  />
                  <input
                    type="time"
                    value={settings.dinnerBreakEnd}
                    onChange={(e) => setSettings({ ...settings, dinnerBreakEnd: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-lg"
                    placeholder="结束时间"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  💵 货币符号
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-lg"
                >
                  <option value="¥">¥ 人民币</option>
                  <option value="$">$ 美元</option>
                  <option value="€">€ 欧元</option>
                  <option value="£">£ 英镑</option>
                </select>
              </div>

              <div className="p-4 bg-red-50 rounded-xl text-red-700 text-sm border-2 border-red-200">
                💡 提示：午餐休息时间默认开启，晚餐休息可选。休息时间内收入将暂停计算，设置会自动保存！٩(๑❛ᴗ❛๑)۶
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

