using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace VeriPlatform.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendPasswordResetEmail(string toEmail, string username, string resetCode)
    {
        var smtpHost = _config["Smtp:Host"];
        var smtpPort = int.Parse(_config["Smtp:Port"] ?? "587");
        var smtpUsername = _config["Smtp:Username"];
        var smtpPassword = _config["Smtp:Password"];
        var fromEmail = _config["Smtp:FromEmail"] ?? "VeriPlatform <noreply@veriplatform.com>";

        if (string.IsNullOrEmpty(smtpUsername) || smtpUsername == "sizinmail@gmail.com")
        {
            Console.WriteLine($"[EMAIL] SMTP ayarları yapılandırılmamış. Kod: {resetCode}");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(fromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = "VeriPlatform - Şifre Sıfırlama Kodu";

        message.Body = new TextPart("html")
        {
            Text = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ background: white; border-radius: 10px; padding: 30px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #6366f1; }}
        .code {{ background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-family: monospace; color: #111827; margin: 20px 0; }}
        .warning {{ color: #6b7280; font-size: 12px; margin-top: 20px; }}
        .footer {{ text-align: center; color: #9ca3af; font-size: 11px; margin-top: 30px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>VeriPlatform</div>
        </div>
        <p>Merhaba <strong>{username}</strong>,</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki doğrulama kodunu kullanın:</p>
        <div class='code'>{resetCode}</div>
        <p class='warning'>⚠️ Bu kod 15 dakika içinde süresi dolacaktır. Kodu kimseyle paylaşmayın.</p>
        <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
        <div class='footer'>
            VeriPlatform © {DateTime.Now.Year}
        </div>
    </div>
</body>
</html>"
        };

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtpUsername, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            
            Console.WriteLine($"[EMAIL] Şifre sıfırlama kodu gönderildi: {toEmail}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL ERROR] Gönderim başarısız: {ex.Message}");
            Console.WriteLine($"[EMAIL] Yedek olarak kod: {resetCode}");
            throw;
        }
    }
}
