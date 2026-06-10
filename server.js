const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log('📱 جهاز جديد متصل:', socket.id);

    // انضمام لغرفة
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`✅ ${socket.id} انضم للغرفة: ${roomId}`);
    });

    // طلب وقت السيرفر (لحساب الفرق بين أجهزة المستخدمين)
    socket.on('get-server-time', () => {
        socket.emit('server-time', Date.now());
    });

    // استقبال أمر البث من أي جهاز
    socket.on('broadcast-sync', (data) => {
        // تحديد وقت بدء التشغيل بعد 5 ثواني من الآن
        const startAt = Date.now() + 5000;
        console.log(`📡 أمر بث من ${socket.id} في الغرفة ${data.roomId} إلى الوقت ${data.targetTime}، البدء عند ${startAt}`);
        
        // إرسال الأمر لجميع الأجهزة في الغرفة (بما فيهم المرسل نفسه)
        io.to(data.roomId).emit('execute-sync', {
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
});
