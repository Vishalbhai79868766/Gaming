const PROHIBITED_KEYWORDS = ['aimbot_hack', 'slur_keyword', 'cheat_engine'];

export function filterProfanity(input: string): string {
  let filtered = input;
  for (const word of PROHIBITED_KEYWORDS) {
    const reg = new RegExp(word, 'gi');
    filtered = filtered.replace(reg, '***');
  }
  return filtered;
}