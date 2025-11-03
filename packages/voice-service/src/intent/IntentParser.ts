/**
 * Intent Parser - يستخدم CommandParser الموجود من terminal
 * لا حاجة لإعادة اختراع العجلة!
 */

export interface ParsedIntent {
  intent: string;
  entities: {
    args: string[];
    flags: Record<string, string | boolean>;
  };
  confidence: number;
  rawText: string;
}

export class IntentParser {
  /**
   * تحليل النص واستخراج النية
   * يستخدم نفس منطق CommandParser من terminal
   */
  parse(text: string): ParsedIntent {
    const trimmed = text.trim().toLowerCase();
    
    // تقسيم النص لكلمات
    const words = trimmed.split(/\s+/);
    const command = words[0] || '';
    const rest = words.slice(1);

    // استخراج الـ args والـ flags
    const args: string[] = [];
    const flags: Record<string, string | boolean> = {};

    for (let i = 0; i < rest.length; i++) {
      const word = rest[i];
      
      if (word.startsWith('--')) {
        // Long flag: --flag أو --flag=value
        const flagName = word.substring(2);
        const equalIndex = flagName.indexOf('=');
        
        if (equalIndex > 0) {
          flags[flagName.substring(0, equalIndex)] = flagName.substring(equalIndex + 1);
        } else {
          flags[flagName] = true;
        }
      } else if (word.startsWith('-')) {
        // Short flag: -f
        const flagName = word.substring(1);
        flags[flagName] = true;
      } else {
        // Argument عادي
        args.push(word);
      }
    }

    // حساب الثقة بناءً على وضوح الأمر
    const confidence = this.calculateConfidence(command, args, flags);

    return {
      intent: command,
      entities: { args, flags },
      confidence,
      rawText: text,
    };
  }

  /**
   * حساب درجة الثقة
   */
  private calculateConfidence(
    command: string,
    args: string[],
    flags: Record<string, any>
  ): number {
    let confidence = 0.5; // قاعدة أساسية

    // أمر واضح ومعروف
    const knownCommands = [
      'create', 'open', 'close', 'search', 'find',
      'delete', 'remove', 'list', 'show', 'help',
      'run', 'execute', 'start', 'stop'
    ];

    if (knownCommands.includes(command)) {
      confidence += 0.3;
    }

    // لديه arguments
    if (args.length > 0) {
      confidence += 0.1;
    }

    // لديه flags
    if (Object.keys(flags).length > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * تحويل النية لتنسيق أكثر وضوحاً
   */
  formatIntent(parsed: ParsedIntent): string {
    const parts = [parsed.intent];
    
    if (parsed.entities.args.length > 0) {
      parts.push(...parsed.entities.args);
    }

    const flagStrings = Object.entries(parsed.entities.flags).map(
      ([key, value]) => {
        if (value === true) return `--${key}`;
        return `--${key}=${value}`;
      }
    );

    parts.push(...flagStrings);

    return parts.join(' ');
  }

  /**
   * التحقق من صحة النية
   */
  isValid(parsed: ParsedIntent): boolean {
    return (
      parsed.intent.length > 0 &&
      parsed.confidence >= 0.5
    );
  }
}
