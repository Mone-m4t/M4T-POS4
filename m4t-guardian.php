<?php
/**
 * 🛡️ M4T SHIELD - SERVER-SIDE SECURITY ENGINE v6.0
 * @author Develop By: Kham Mone Dev
 * สถาปัตยกรรมความปลอดภัยระดับ Enterprise ป้องกันการเจาะระบบจากต้นทาง
 */

declare(strict_types=1);

class M4TGuardian {
    private static $instance = null;

    private function __construct() {
        $this->bootSecurityHeaders();
        $this->initSession();
        $this->wafLayer();
    }

    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * 1. ป้องกันการโจมตีผ่าน Browser (XSS, Clickjacking, Sniffing)
     * เทียบเท่ามาตรฐาน Facebook/Lazada
     */
    private function bootSecurityHeaders(): void {
        header("X-Frame-Options: DENY");
        header("X-Content-Type-Options: nosniff");
        header("X-XSS-Protection: 1; mode=block");
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
        header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
        header("Referrer-Policy: no-referrer");
    }

    /**
     * 2. ระบบจัดการ Session และป้องกัน Session Hijacking
     */
    private function initSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', '1');
            ini_set('session.cookie_secure', '1');
            ini_set('session.use_only_cookies', '1');
            session_start();
        }

        // ตรวจสอบ Fingerprint เบื้องต้น (IP + User Agent)
        $fingerprint = md5($_SERVER['REMOTE_ADDR'] . $_SERVER['HTTP_USER_AGENT']);
        if (!isset($_SESSION['m4t_fingerprint'])) {
            $_SESSION['m4t_fingerprint'] = $fingerprint;
        } elseif ($_SESSION['m4t_fingerprint'] !== $fingerprint) {
            session_destroy();
            die("🚨 Security Violation: Session Compromised");
        }
    }

    /**
     * 3. WAF (Web Application Firewall) แบบ Lightweight
     * ดักจับ SQL Injection และ Malicious Payloads
     */
    private function wafLayer(): void {
        $patterns = [
            '/<script.*?>.*?<\/script>/is',
            '/union\s+select/i',
            '/--/i',
            '/\b(drop|delete|truncate)\b/i'
        ];

        foreach ($_REQUEST as $key => $value) {
            if (is_string($value)) {
                foreach ($patterns as $pattern) {
                    if (preg_match($pattern, $value)) {
                        $this->logAttack($key, $value);
                        http_response_code(403);
                        die("<h1>403 Forbidden</h1>M4T Shield blocked a malicious request.");
                    }
                }
            }
        }
    }

    /**
     * 4. ป้องกันการดัดแปลงราคาสินค้า (Price Integrity)
     * ใช้ระบบ Logic Check แทนการเชื่อ Data จากฝั่ง User
     */
    public static function validateTransaction(float $userPrice, float $realPrice): bool {
        if (abs($userPrice - $realPrice) > 0.0001) {
            error_log("Price Tampering Detected!");
            return false;
        }
        return true;
    }

    private function logAttack($field, $value): void {
        $log = "[" . date('Y-m-d H:i:s') . "] Attack on $field: " . htmlspecialchars($value) . " | IP: " . $_SERVER['REMOTE_ADDR'] . PHP_EOL;
        file_put_contents('security_audit.log', $log, FILE_APPEND);
    }
}

// เริ่มการทำงานทันที
$guardian = M4TGuardian::getInstance();
                
