# Realtime Messenger

Современное веб-приложение для обмена сообщениями в реальном времени с использованием React, Socket.IO и Express.

## Особенности

- Чат в реальном времени с мгновенной доставкой сообщений
- Групповые и личные чаты
- Индикаторы набора текста
- Статусы прочтения сообщений
- Уведомления о новых сообщениях
- Адаптивный дизайн для мобильных и десктопных устройств
- Темная и светлая темы
- Аутентификация и авторизация пользователей

## Технологии

- **Фронтенд**: React, TailwindCSS, Headless UI
- **Стейт-менеджмент**: Zustand
- **Коммуникация в реальном времени**: Socket.IO
- **API запросы**: Axios
- **Роутинг**: React Router
- **Уведомления**: React-Toastify

## Реализация WebSockets для обмена сообщениями

Система обмена сообщениями в реальном времени реализована с использованием Socket.IO и следующей архитектуры:

### Инициализация и подключение сокетов

```javascript
// Инициализация сокета с настройками повторного подключения
const socket = io(socketUrl, {
  auth: { token }, // JWT токен для аутентификации
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

// Обработка подключения
socket.on('connect', () => {
  console.log('Socket connected with ID:', socket.id);
  
  // Автоматическое присоединение ко всем чатам пользователя
  const chats = useChatStore.getState().chats;
  if (chats && chats.length > 0) {
    chats.forEach(chat => {
      socket.emit('joinChat', chat._id);
    });
  }
});
```

### Обработка событий чата

```javascript
// Получение нового сообщения
socket.on('newMessage', (message) => {
  if (!message || !message._id || !message.chatId) {
    console.error('Received invalid message format:', message);
    return;
  }
  
  // Добавление сообщения в стор
  useChatStore.getState().addNewMessage(message);
});

// Индикаторы набора текста
socket.on('typing', ({ chatId, userId }) => {
  useChatStore.getState().setUserTyping(chatId, userId, true);
});

socket.on('stopTyping', ({ chatId, userId }) => {
  useChatStore.getState().setUserTyping(chatId, userId, false);
});

// Статусы прочтения сообщений
socket.on('messageRead', ({ messageId, userId }) => {
  // Обновление статуса прочтения в хранилище
  const { messages } = useChatStore.getState();
  // Проверки на существование данных
  if (!messages.length) return;
  
  // Обновление сообщений
  const updatedMessages = messages.map(message => {
    if (message._id === messageId && message.readBy && !message.readBy.includes(userId)) {
      return {
        ...message,
        readBy: [...message.readBy, userId]
      };
    }
    return message;
  });
  
  useChatStore.setState({ messages: updatedMessages });
});
```

### Обработка новых сообщений

```javascript
// Обработка нового сообщения, полученного через сокет
addNewMessage: (message) => {
  const { currentChat, messages, chats } = get();
  
  try {
    // Проверка, является ли текущий чат получателем сообщения
    if (currentChat && message.chatId === currentChat._id) {
      // Проверка на дубликаты
      const messageExists = messages.some(msg => msg._id === message._id);
      if (messageExists) return;
      
      // Добавление сообщения в список
      set({ messages: [...messages, message] });
    } else {
      // Инкремент счетчика непрочитанных сообщений
      set(state => ({
        unreadCounts: {
          ...state.unreadCounts,
          [message.chatId]: (state.unreadCounts[message.chatId] || 0) + 1
        }
      }));
      
      // Звуковое уведомление
      const audio = new Audio('/notification.mp3');
      audio.play().catch(err => console.log('Error playing sound:', err));
    }

    // Обновление и сортировка списка чатов
    set(state => ({
      chats: state.chats.map(chat => {
        if (chat._id === message.chatId) {
          return { ...chat, lastMessage: message };
        }
        return chat;
      }).sort((a, b) => {
        // Чат с новым сообщением переместить вверх
        if (a._id === message.chatId) return -1;
        if (b._id === message.chatId) return 1;
        
        // Сортировка по времени последнего сообщения
        const aTime = a.lastMessage?.createdAt || a.updatedAt || 0;
        const bTime = b.lastMessage?.createdAt || b.updatedAt || 0;
        return new Date(bTime) - new Date(aTime);
      })
    }));
  } catch (error) {
    console.error('Error processing message:', error);
  }
}
```

### Обработка отправки сообщений

```javascript
// Отправка сообщения через UI компонент
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const trimmedMessage = message.trim();
  if (!trimmedMessage || isSending) return;
  
  try {
    setIsSending(true);
    
    // Отправка сообщения через API + сокет
    await onSendMessage(trimmedMessage);
    
    // Очистка ввода и индикатора набора
    setMessage('');
    if (connected) {
      sendTyping(chatId, false);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    setIsSending(false);
    inputRef.current?.focus();
  }
};
```

## Отказоустойчивость и обработка проблем

В проекте реализованы механизмы для обеспечения надежной работы с сокетами:

1. **Автоматическое переподключение** при потере соединения
2. **Проверка состояния подключения** перед отправкой сообщений
3. **Индикаторы состояния подключения** для пользователя
4. **Обработка ошибок** при получении и отправке сообщений
5. **Предотвращение дублирования** сообщений
6. **Синхронизация статусов прочтения** между устройствами

## Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр продакшен-сборки
npm run preview
```

## Переменные окружения

Создайте файл `.env` в корневой директории:

```
VITE_API_URL=http://localhost:5000/api
```
