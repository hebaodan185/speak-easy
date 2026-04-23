document.addEventListener('DOMContentLoaded', function() {
    // ----- DOM 元素 -----
    const loginPanel = document.getElementById('loginPanel');
    const registerPanel = document.getElementById('registerPanel');
    const voicePanel = document.getElementById('voicePanel');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const showRegisterLink = document.getElementById('showRegisterLink');
    const showLoginLink = document.getElementById('showLoginLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const startBtn = document.getElementById('start-btn');
    const resultDiv = document.getElementById('result');
    const settingsBtn = document.getElementById('settingsBtn');
    const configPanel = document.getElementById('configPanel');
    const closeConfigBtn = document.getElementById('closeConfigBtn');
    const configList = document.getElementById('configList');
    const newPhrase = document.getElementById('newPhrase');
    const newAction = document.getElementById('newAction');
    const addConfigBtn = document.getElementById('addConfigBtn');
    const statsBtn = document.getElementById('statsBtn');
    const statsPanel = document.getElementById('statsPanel');
    const closeStatsBtn = document.getElementById('closeStatsBtn');

    // ----- 全局变量 -----
    let currentToken = null;
    let recognition = null;
    let isListening = false;
    let customCommands = {};

    // ----- 辅助函数 -----
    function showLoginPanel() {
        if (loginPanel) loginPanel.classList.remove('hidden');
        if (registerPanel) registerPanel.classList.add('hidden');
        if (voicePanel) voicePanel.classList.add('hidden');
    }
    function showRegisterPanel() {
        if (loginPanel) loginPanel.classList.add('hidden');
        if (registerPanel) registerPanel.classList.remove('hidden');
        if (voicePanel) voicePanel.classList.add('hidden');
    }
    function showVoicePanel() {
        if (loginPanel) loginPanel.classList.add('hidden');
        if (registerPanel) registerPanel.classList.add('hidden');
        if (voicePanel) voicePanel.classList.remove('hidden');
        initSpeechRecognition();
        loadCustomCommands();
    }

    // 关闭所有面板（配置、统计）
    function closeAllPanels() {
        if (configPanel) configPanel.classList.add('hidden');
        if (statsPanel) statsPanel.classList.add('hidden');
    }

// ----- 统计功能：加载并渲染图表（使用Canvas，无外部依赖）-----
    function loadStats() {
        if (!currentToken) return;
        fetch('http://localhost:8080/api/stats', {
            headers: { 'Authorization': 'Bearer ' + currentToken }
        })
            .then(res => res.json())
            .then(data => {
                // 渲染常用命令列表
                const topList = document.getElementById('topCommandsList');
                if (topList) {
                    topList.innerHTML = '';
                    if (data.topCommands.length === 0) {
                        topList.innerHTML = '<li>暂无命令记录</li>';
                    } else {
                        data.topCommands.forEach(item => {
                            const li = document.createElement('li');
                            li.textContent = `${item.command} (${item.count}次)`;
                            topList.appendChild(li);
                        });
                    }
                }

                // 绘制柱状图（使用Canvas）
                const chartContainer = document.getElementById('statsChart');
                if (!chartContainer) return;
                // 清空容器，创建canvas
                chartContainer.innerHTML = '<canvas id="statsCanvas" width="320" height="200" style="width:100%; height:200px;"></canvas>';
                const canvas = document.getElementById('statsCanvas');
                const ctx = canvas.getContext('2d');
                const dates = Object.keys(data.dailyCount);
                const counts = Object.values(data.dailyCount);
                const maxCount = Math.max(...counts, 1);
                const barWidth = (canvas.width - 40) / dates.length - 4;
                const startX = 30;
                const startY = canvas.height - 20;

                // 清空
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // 绘制坐标轴
                ctx.beginPath();
                ctx.moveTo(20, 10);
                ctx.lineTo(20, startY);
                ctx.lineTo(canvas.width - 10, startY);
                ctx.stroke();
                // 绘制柱状图
                for (let i = 0; i < dates.length; i++) {
                    const x = startX + i * (barWidth + 4);
                    const height = (counts[i] / maxCount) * (startY - 30);
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillRect(x, startY - height, barWidth, height);
                    ctx.fillStyle = '#333';
                    ctx.font = '10px Arial';
                    ctx.fillText(dates[i], x, startY + 12);
                    ctx.fillStyle = '#000';
                    ctx.fillText(counts[i], x + barWidth/2 - 5, startY - height - 2);
                }
                // 标注Y轴
                ctx.fillStyle = '#000';
                ctx.fillText('命令次数', 5, 20);
            })
            .catch(err => console.error('加载统计失败:', err));
    }

    // ----- 从后端加载自定义命令-----
    function loadCustomCommands() {
        if (!currentToken) return;
        fetch('http://localhost:8080/api/user/config', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + currentToken }
        })
            .then(res => res.json())
            .then(data => {
                if (data.config && data.config !== '{}') {
                    try {
                        customCommands = JSON.parse(data.config);
                    } catch(e) { customCommands = {}; }
                } else {
                    customCommands = {};
                }
                renderConfigList();
                console.log('已加载自定义命令:', customCommands);
            })
            .catch(err => console.error('加载配置失败:', err));
    }

    function saveCustomCommands() {
        if (!currentToken) return;
        fetch('http://localhost:8080/api/user/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + currentToken
            },
            body: JSON.stringify({ config: JSON.stringify(customCommands) })
        })
            .then(res => res.text())
            .then(msg => console.log('保存配置结果:', msg))
            .catch(err => console.error('保存配置失败:', err));
    }

    function renderConfigList() {
        if (!configList) return;
        configList.innerHTML = '';
        for (const [phrase, action] of Object.entries(customCommands)) {
            const div = document.createElement('div');
            div.className = 'config-item';
            div.innerHTML = `
                <input type="text" value="${escapeHtml(phrase)}" data-phrase="${phrase}" class="edit-phrase">
                <input type="text" value="${escapeHtml(action)}" data-phrase="${phrase}" class="edit-action">
                <button class="delete-btn" data-phrase="${phrase}">删除</button>
            `;
            configList.appendChild(div);
        }
        document.querySelectorAll('.edit-phrase').forEach(input => {
            input.addEventListener('change', function() {
                const oldPhrase = this.dataset.phrase;
                const newPhrase = this.value.trim();
                if (newPhrase && newPhrase !== oldPhrase) {
                    const action = customCommands[oldPhrase];
                    delete customCommands[oldPhrase];
                    customCommands[newPhrase] = action;
                    saveCustomCommands();
                    renderConfigList();
                }
            });
        });
        document.querySelectorAll('.edit-action').forEach(input => {
            input.addEventListener('change', function() {
                const phrase = this.dataset.phrase;
                const newAction = this.value.trim();
                if (newAction) {
                    customCommands[phrase] = newAction;
                    saveCustomCommands();
                    renderConfigList();
                }
            });
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const phrase = this.dataset.phrase;
                delete customCommands[phrase];
                saveCustomCommands();
                renderConfigList();
            });
        });
    }

    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function addCustomCommand() {
        const phrase = newPhrase.value.trim();
        const action = newAction.value.trim();
        if (!phrase || !action) {
            alert('请填写语音短语和动作');
            return;
        }
        customCommands[phrase] = action;
        saveCustomCommands();
        renderConfigList();
        newPhrase.value = '';
        newAction.value = '';
    }

    function executeCustomAction(action) {
        switch (action) {
            case 'close_tab':
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.remove(tabs[0].id);
                });
                break;
            default:
                if (action.startsWith('open_url:')) {
                    const url = action.substring(9);
                    chrome.tabs.create({ url: url });
                } else {
                    console.warn('未知动作:', action);
                }
        }
    }

    // ----- AI 调用函数-----
    function callAi(userMessage, resultDiv) {
        if (!currentToken) {
            resultDiv.textContent = '请先登录';
            return;
        }
        resultDiv.innerHTML = '<div style="color:#666;">AI 思考中...</div>';
        fetch('http://localhost:8080/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + currentToken
            },
            body: JSON.stringify({ message: userMessage })
        })
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
            })
            .then(answer => {
                resultDiv.innerHTML = `<div style="color:#000;">🤖 AI: ${answer}</div>`;
            })
            .catch(err => {
                console.error('AI调用失败:', err);
                resultDiv.innerHTML = '<div style="color:red;">AI服务暂时不可用</div>';
            });
    }

    // ----- 语音识别初始化-----
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            if (resultDiv) resultDiv.textContent = '❌ 您的浏览器不支持语音识别，请使用Chrome浏览器';
            if (startBtn) startBtn.disabled = true;
            return;
        }
        if (recognition) {
            try { recognition.abort(); } catch(e) {}
            recognition = null;
        }
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'zh-CN';

        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div style="color:#666;">实时: ${interimTranscript}</div>
                    <div style="color:#000; font-weight:bold;">最终: ${finalTranscript}</div>
                `;
            }
            if (finalTranscript) {
                console.log('🎤 识别结果:', finalTranscript);
                // 上报命令
                if (currentToken) {
                    fetch('http://localhost:8080/api/command/log', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + currentToken
                        },
                        body: JSON.stringify({ command: finalTranscript })
                    }).catch(err => console.error('上报失败:', err));
                }
                // 自定义命令匹配
                let matched = false;
                for (const [phrase, action] of Object.entries(customCommands)) {
                    if (finalTranscript.includes(phrase)) {
                        console.log(`匹配自定义命令: ${phrase} -> ${action}`);
                        executeCustomAction(action);
                        matched = true;
                        break;
                    }
                }
                if (matched) return;

                // AI 命令
                if (finalTranscript.includes('总结') || finalTranscript.includes('摘要')) {
                    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                        const url = tabs[0].url;
                        const prompt = `请总结以下网页的内容：${url}`;
                        callAi(prompt, resultDiv);
                    });
                    return;
                }
                if (finalTranscript.includes('写邮件') || finalTranscript.includes('发邮件')) {
                    callAi(finalTranscript, resultDiv);
                    return;
                }
                if (finalTranscript.includes('搜索') || finalTranscript.includes('查找')) {
                    callAi(finalTranscript, resultDiv);
                    return;
                }

                // 打开网页命令
                const text = finalTranscript.toLowerCase();
                if (text.includes('打开')) {
                    let target = text.replace('打开', '').trim();
                    if (target.includes('.') && !target.includes(' ')) {
                        let url = target.startsWith('http') ? target : 'https://' + target;
                        chrome.tabs.create({ url: url });
                        return;
                    }
                    target = target.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
                    const siteMap = {
                        '百度': 'baidu.com',
                        '谷歌': 'google.com',
                        'google': 'google.com',
                        '哔哩哔哩': 'bilibili.com',
                        '淘宝': 'taobao.com',
                        '京东': 'jd.com',
                        '知乎': 'zhihu.com',
                        '微博': 'weibo.com',
                        'github': 'github.com'
                    };
                    if (siteMap[target]) {
                        chrome.tabs.create({ url: 'https://www.' + siteMap[target] });
                        return;
                    }
                    chrome.tabs.create({ url: 'https://www.' + target + '.com' });
                }
                if (text.includes('向下滚动') || text.includes('往下滚')) {
                    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            func: () => { window.scrollBy(0, 300); }
                        });
                    });
                }
                if (text.includes('向上滚动') || text.includes('往上滚')) {
                    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            func: () => { window.scrollBy(0, -300); }
                        });
                    });
                }
            }
        };

        recognition.onend = function() {
            isListening = false;
            if (startBtn) {
                startBtn.textContent = '开始录音';
                startBtn.classList.remove('listening');
            }
            console.log('⏹️ 识别结束');
        };

        recognition.onerror = function(event) {
            console.error('❌ 识别错误:', event.error);
            if (resultDiv) resultDiv.textContent = `错误: ${event.error}`;
            isListening = false;
            if (startBtn) {
                startBtn.textContent = '开始录音';
                startBtn.classList.remove('listening');
            }
        };

        if (startBtn) {
            startBtn.onclick = function() {
                if (isListening) {
                    recognition.stop();
                } else {
                    recognition.start();
                    isListening = true;
                    startBtn.textContent = '停止录音';
                    startBtn.classList.add('listening');
                    if (resultDiv) resultDiv.textContent = '正在聆听...';
                    console.log('🎤 开始录音');
                }
            };
        }
    }

    // ----- 登录逻辑 -----
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            if (!username || !password) {
                if (loginError) loginError.textContent = '用户名和密码不能为空';
                return;
            }
            fetch('http://localhost:8080/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.token) {
                        chrome.storage.local.set({ token: data.token }, function() {
                            currentToken = data.token;
                            showVoicePanel();
                        });
                    } else {
                        if (loginError) loginError.textContent = data.message || '登录失败';
                    }
                })
                .catch(err => {
                    console.error(err);
                    if (loginError) loginError.textContent = '网络错误，请确保后端已启动';
                });
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            if (!username || !password) {
                if (registerError) registerError.textContent = '用户名和密码不能为空';
                return;
            }
            fetch('http://localhost:8080/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
                .then(res => res.text())
                .then(msg => {
                    if (msg === '注册成功') {
                        alert('注册成功，请登录');
                        showLoginPanel();
                    } else {
                        if (registerError) registerError.textContent = msg;
                    }
                })
                .catch(err => {
                    console.error(err);
                    if (registerError) registerError.textContent = '网络错误';
                });
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterPanel();
        });
    }
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginPanel();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            chrome.storage.local.remove('token', function() {
                currentToken = null;
                customCommands = {};
                showLoginPanel();
                if (recognition) {
                    recognition.abort();
                    recognition = null;
                }
                isListening = false;
            });
        });
    }

    // ----- 设置面板 -----
    if (settingsBtn && configPanel) {
        settingsBtn.addEventListener('click', () => {
            closeAllPanels();
            configPanel.classList.toggle('hidden');
            if (!configPanel.classList.contains('hidden')) {
                renderConfigList();
            }
        });
    }
    if (closeConfigBtn) {
        closeConfigBtn.addEventListener('click', () => {
            configPanel.classList.add('hidden');
        });
    }
    if (addConfigBtn) {
        addConfigBtn.addEventListener('click', addCustomCommand);
    }

    // ----- 统计面板 -----
    if (statsBtn && statsPanel) {
        statsBtn.addEventListener('click', () => {
            closeAllPanels();
            statsPanel.classList.toggle('hidden');
            if (!statsPanel.classList.contains('hidden')) {
                loadStats();  // 打开时加载数据
            }
        });
    }
    if (closeStatsBtn) {
        closeStatsBtn.addEventListener('click', () => {
            statsPanel.classList.add('hidden');
        });
    }

    // ----- 检查登录状态 -----
    function checkLogin() {
        chrome.storage.local.get(['token'], function(result) {
            if (result.token) {
                currentToken = result.token;
                showVoicePanel();
            } else {
                showLoginPanel();
            }
        });
    }
    checkLogin();
});