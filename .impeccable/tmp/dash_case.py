import re, glob

pat = re.compile(r"(?<=[>\n])(\s*)([A-Z][A-Z0-9&'\-.,:]*(?: [A-Z0-9][A-Z0-9&'\-.,:]*)+)(\s*)(?=<|\n)")
SPECIAL = {'API': 'API', 'PNL': 'P&L', 'L2': 'L2', 'AI': 'AI', 'ARAIVEN': 'Araiven'}

def sentence(t):
    words = t.split(' ')
    out = []
    for i, w in enumerate(words):
        if w in SPECIAL:
            out.append(SPECIAL[w])
        elif i == 0:
            out.append(w[0] + w[1:].lower())
        else:
            out.append(w.lower())
    return ' '.join(out)

for p in glob.glob('src/components/dashboard/*.tsx'):
    s = open(p, encoding='utf8').read()
    def rep(m):
        ls = s.rfind('\n', 0, m.start()) + 1
        if s[ls:m.end()].lstrip().startswith(('//', '{/*', '*', 'import')):
            return m.group(0)
        return m.group(1) + sentence(m.group(2)) + m.group(3)
    o = pat.sub(rep, s)
    # wide tracking belonged to uppercase labels
    o = re.sub(r"letterSpacing: '0\.(0[3-9]|1)\d*em'", "letterSpacing: '0'", o)
    o = o.replace("{activeSymbol} CANDLESTICK RADAR", "{activeSymbol} candlestick radar")
    if o != s:
        open(p, 'w', encoding='utf8').write(o)
        print('updated', p)
