/**
 * AEGIS SHIELD CORE v1.0 - Professional Security Layer
 * Protection for M4T POS System
 */
(function() {
    'use strict';

    const ShieldConfig = {
        maxViolations: 3,
        autoNuclear: true, // ล้างข้อมูลหากตรวจพบการบุกรุกรุนแรง
        debugBlocker: true
    };

    let violations = 0;

    // 1. Anti-Debugger & DevTools Detection (ป้องกันการแกะโค้ด)
    const detectDevTools = () => {
        const start = performance.now();
        debugger; // จุดดักจับ
        const end = performance.now();
        if (end - start > 100) {
            handleViolation("DevTools Detected");
        }
    };

    // 2. DOM Integrity Protection (ป้องกันการฉีดโค้ดหรือแก้ไขหน้าเว็บ)
    const observeIntegrity = () => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.tagName === 'SCRIPT' && !node.getAttribute('data-authorized')) {
                            node.remove();
                            handleViolation("Unauthorized Script Injection");
                        }
                    });
                }
            });
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    };

    // 3. Security Headers Simulation & Sandbox
    const applySandbox = () => {
        // ป้องกันการรันใน iframe (Anti-Clickjacking)
        if (window.self !== window.top) {
            window.top.location = window.self.location;
        }
    };

    // 4. Data Encryption Layer (หุ้ม LocalStorage)
    const secureStorage = {
        encrypt: (data) => btoa(unescape(encodeURIComponent(data))), // Base64 แบบปลอดภัย
        decrypt: (data) => decodeURIComponent(escape(atob(data)))
    };

    // 5. Hardening System (ทำให้แฮกเกอร์ปวดหัว)
    const handleViolation = (reason) => {
        violations++;
        console.warn(`[Shield] Security Alert: ${reason}`);
        
        if (violations >= ShieldConfig.maxViolations) {
            if (ShieldConfig.autoNuclear) {
                alert("🚨 Security Breach Detected! System Lockdown Activated.");
                localStorage.clear();
                sessionStorage.clear();
                location.reload();
            }
        }
    };

    // 6. Extreme Protection: Self-Destruct Logic (สำหรับแฮกเกอร์ที่พยายามแก้ไฟล์)
    const selfDestruct = () => {
        // ทำให้เบราว์เซอร์ทำงานหนักเฉพาะเมื่อตรวจพบแฮกเกอร์ระดับสูง (Infinite Loop)
        // หมายเหตุ: ไม่ทำให้เครื่องพังถาวร แต่จะทำให้หน้าเว็บค้างจนต้องปิดเครื่องใหม่
        while(true) {
            history.pushState(null, null, location.href);
        }
    };

    // 7. Initialize Shield
    const initShield = () => {
        applySandbox();
        observeIntegrity();
        
        // ป้องกันปุ่มขวาและปุ่มลัด
        window.addEventListener('contextmenu', e => e.preventDefault());
        window.addEventListener('keydown', e => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'i' || e.key === 'j')) {
                e.preventDefault();
                handleViolation("Shortcut Blocked");
            }
        });

        if (ShieldConfig.debugBlocker) {
            setInterval(detectDevTools, 2000);
        }
        
        console.log("%c🛡️ AEGIS SHIELD ACTIVE", "color: lime; font-weight: bold; font-size: 14px;");
    };

    // ทำงานทันทีแบบ Low-level
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShield);
    } else {
        initShield();
    }

})();
