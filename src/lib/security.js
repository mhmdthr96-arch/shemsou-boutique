/**
 * ⚜️ SHEMSOU BOUTIQUE - Security & Anti-Exploit Shield
 * Protection against XSS, Script Injection, Python/Shell Commands,
 * Spams, Rate Limiting, and Quota Flooding.
 */

// Malicious patterns regex (XSS, Script Injection, Python execution patterns, SQL control characters)
const MALICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript\s*:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /data:\s*text\/html/gi,
  /eval\s*\(/gi,
  /exec\s*\(/gi,
  /__import__\s*\(/gi,
  /subprocess\./gi,
  /import\s+os\b/gi,
  /os\.system\s*\(/gi,
  /import\s+sys\b/gi,
  /system\s*\(/gi,
  /passthru\s*\(/gi,
  /shell_exec\s*\(/gi,
  /;\s*DROP\s+TABLE/gi,
  /UNION\s+SELECT/gi,
  /--/g
];

/**
 * Sanitize a raw string to ensure safe storage and display
 * @param {string} input - Raw input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized clean string
 */
export function sanitizeInput(input, maxLength = 300) {
  if (typeof input !== 'string') return '';
  
  let cleaned = input.trim();
  
  // Truncate to maximum length to prevent buffer/memory attacks
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  // Remove all malicious patterns
  for (const pattern of MALICIOUS_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Strip raw HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  return cleaned.trim();
}

/**
 * Recursively sanitize an entire form data object
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'string' ? sanitizeInput(item) : sanitizeObject(item)));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Anti-Spam Rate Limiter (Token Bucket / Cooldown system)
 */
class ClientRateLimiter {
  constructor() {
    this.storageKey = 'sb_rate_limit_timestamps';
    this.maxRequestsPerWindow = 5; // Max 5 submissions
    this.windowMs = 60 * 1000; // per 1 minute
    this.cooldownSeconds = 5; // Min 5 seconds between consecutive orders
  }

  getTimestamps() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveTimestamps(timestamps) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(timestamps));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Check if action is permitted or rate limited
   * @returns {{ allowed: boolean, remainingCooldown: number, message?: string }}
   */
  canProceed() {
    const now = Date.now();
    const timestamps = this.getTimestamps().filter(t => now - t < this.windowMs);

    // Check consecutive cooldown
    if (timestamps.length > 0) {
      const lastAction = timestamps[timestamps.length - 1];
      const elapsed = (now - lastAction) / 1000;
      if (elapsed < this.cooldownSeconds) {
        const remaining = Math.ceil(this.cooldownSeconds - elapsed);
        return {
          allowed: false,
          remainingCooldown: remaining,
          message: `يرجى الانتظار ${remaining} ثوانٍ قبل تقديم طلب آخر.`
        };
      }
    }

    // Check sliding window limit
    if (timestamps.length >= this.maxRequestsPerWindow) {
      return {
        allowed: false,
        remainingCooldown: 30,
        message: 'لقد تم إرسال عدة طلبات مؤخراً. يرجى الانتظار دقيقة واحدة.'
      };
    }

    return { allowed: true, remainingCooldown: 0 };
  }

  /**
   * Record an action timestamp
   */
  recordAction() {
    const now = Date.now();
    const timestamps = this.getTimestamps().filter(t => now - t < this.windowMs);
    timestamps.push(now);
    this.saveTimestamps(timestamps);
  }
}

export const rateLimiter = new ClientRateLimiter();

/**
 * Validate customer checkout form payload
 */
export function validateOrderData(order) {
  const errors = {};

  if (!order.customer_name || sanitizeInput(order.customer_name).length < 2) {
    errors.customer_name = 'الاسم مطلوب ويجب أن يكون حرفين على الأقل';
  }

  const phoneClean = (order.customer_phone || '').replace(/[\s\-\+]/g, '');
  if (!phoneClean || phoneClean.length < 8 || !/^[0-9]+$/.test(phoneClean)) {
    errors.customer_phone = 'رقم الهاتف غير صالح';
  }

  if (!order.customer_wilaya || sanitizeInput(order.customer_wilaya).length < 2) {
    errors.customer_wilaya = 'يرجى تحديد الولاية / المدينة';
  }

  if (!order.customer_address || sanitizeInput(order.customer_address).length < 3) {
    errors.customer_address = 'يرجى كتابة العنوان بالتفصيل';
  }

  if (!order.selected_size) {
    errors.selected_size = 'يرجى اختيار المقاس';
  }

  if (!order.selected_color) {
    errors.selected_color = 'يرجى اختيار اللون';
  }

  if (!order.quantity || order.quantity < 1) {
    errors.quantity = 'الكمية يجب أن تكون 1 على الأقل';
  }

  // Honeypot check (hidden field that only spam bots fill)
  if (order.hp_website_check && order.hp_website_check.trim().length > 0) {
    errors.spam = 'Spam detected';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
