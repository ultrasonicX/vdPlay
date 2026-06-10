const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname)));

// معالجة جميع الروابط
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// غرفة واحدة ثابتة للجميع
const MAIN_ROOM = 'main-room';

io.on('connection', (socket) => {
    console.log('📱 جهاز جديد متصل:', socket.id);
    
    // جميع الأجهزة تنضم تلقائياً للغرفة الرئيسية
    socket.join(MAIN_ROOM);
    console.log(`✅ ${socket.id} انضم للغرفة الرئيسية`);

    // طلب وقت السيرفر
    socket.on('get-server-time', () => {
        socket.emit('server-time', Date.now());
    });

    // استقبال أمر البث
    socket.on('broadcast-sync', (data) => {
        const startAt = Date.now() + 5000;  // 5 ثواني - مناسب للإنترنت الضعيف
        console.log(`📡 أمر بث من ${socket.id} إلى الوقت ${data.targetTime}`);
        
        // إرسال لجميع الأجهزة في الغرفة الرئيسية
        io.to(MAIN_ROOM).emit('execute-sync', {
            targetTime: data.targetTime,
            startAt: startAt
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ جهاز انقطع:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
    console.log(`🏠 الغرفة الرئيسية: ${MAIN_ROOM} - جميع المستخدمين فيها`);
});
