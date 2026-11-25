import re
p = 'src/components/landing/landing.css'
s = open(p, encoding='utf8').read()
start = s.index('@font-face')
end = s.index('.rv {\n  --rv-bg')
fonts = s[start:end]
open('src/theme/ravora-fonts.css', 'w', encoding='utf8').write(
    '/* Self-hosted variable fonts shared by the landing page and the auth pages. */\n' + fonts.rstrip() + '\n')
s = s[:start] + s[end:]
# put the @import first, right after the header comment
s = s.replace('/* ==========================================================================\n   Ravora landing page.',
              "@import '../../theme/ravora-fonts.css';\n\n/* ==========================================================================\n   Ravora landing page.", 1)
open(p, 'w', encoding='utf8').write(s)
print('fonts extracted', s.count('@font-face'))
