# SpeakEasy - 智能语音控制浏览器插件

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)](https://spring.io/projects/spring-boot)
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-MV3-yellow)](https://developer.chrome.com/docs/extensions/mv3/)

**SpeakEasy** 是一个基于 Chrome 扩展 + Spring Boot + DeepSeek AI 的语音助手，支持语音打开网页、滚动页面、自定义命令云端同步、AI 智能问答及使用统计。

## 🚀 核心功能

- 🎤 **语音识别**：支持中英文，实时显示识别结果
- 🌐 **打开网页**：说“打开百度”自动跳转，支持常用网站映射
- 📜 **页面滚动**：向下/向上滚动 300px
- 👤 **用户系统**：注册/登录，基于 JWT 认证
- ⚙️ **自定义命令**：设置“摸鱼”→“关闭标签页”，配置云端同步
- 📊 **使用统计**：最近7天命令柱状图 + Top5 常用命令
- 🤖 **AI 智能问答**：调用 DeepSeek API，支持“总结此页面”“写邮件”等

## 🛠️ 技术栈

- **前端**：Chrome Extension MV3, 原生 JavaScript, Web Speech API, Canvas
- **后端**：Spring Boot 3, Spring Data JPA, MySQL, JWT, DeepSeek API

## 📁 项目结构
speak-easy/
├── speak-easy-extension/      # 插件前端
└── speak-easy-backend/        # Spring Boot 后端

## ⚡ 快速开始

### 环境要求
- JDK 17
- MySQL 8.0
- Chrome 浏览器

### 后端启动
1. 创建数据库 `speak_easy`（字符集 utf8mb4）
2. 复制 `src/main/resources/application.properties.example` 为 `application.properties`，填入你的数据库密码和 DeepSeek API Key
3. 运行 `mvn spring-boot:run`

### 插件加载
1. Chrome 打开 `chrome://extensions/`
2. 开启开发者模式
3. 加载已解压的扩展，选择 `speak-easy-extension` 文件夹
4. 注册账号，开始使用

## 🔐 注意事项
- 请勿将包含真实密码的 `application.properties` 提交到 GitHub
- DeepSeek API Key 需自行申请（新用户有免费额度）

## 📄 许可证

MIT
