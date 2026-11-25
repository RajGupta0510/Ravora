import re, glob

RAMP = [0.72, 0.8, 0.88, 1.0, 1.15, 1.6]

def snap(v):
    return min(RAMP, key=lambda r: abs(r - v))

def fmt(v):
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    return s + 'rem'

def transform(s):
    # 1. gradients -> flat amber (the world forbids gradient fills)
    s = re.sub(r"linear-gradient\((?:135deg|90deg),\s*#f59e0b[^)]*\)", "#f59e0b", s)
    s = s.replace("var(--gradient-primary)", "#f59e0b").replace("var(--gradient-interactive)", "#f59e0b")
    # 2. no uppercase micro-labels
    s = re.sub(r"\s*textTransform: 'uppercase',?", "", s)
    # 3. font sizes onto the Operate ramp, 0.72rem floor
    def fs(m):
        val = float(m.group(1))
        return "fontSize: '%s'" % fmt(snap(val))
    s = re.sub(r"fontSize: '([0-9.]+)rem'", fs, s)
    # 4. radii onto the documented scale (4, 7, 8, 12, 14, 99)
    radius_map = {'2px': '4px', '3px': '4px', '5px': '4px', '6px': '7px', '9px': '8px', '10px': '12px', '999px': '99px'}
    def br(m):
        return "borderRadius: '%s'" % radius_map.get(m.group(1), m.group(1))
    s = re.sub(r"borderRadius: '([0-9]+px)'", br, s)
    # 5. off-world colours
    s = s.replace("rgba(14, 19, 37, 0.45)", "rgba(21, 26, 38, 0.6)")
    s = s.replace("rgba(14, 19, 37, 0.98)", "rgba(21, 26, 38, 0.98)")
    s = s.replace("rgba(124, 58, 237, 0.25)", "rgba(245, 158, 11, 0.25)")
    s = s.replace("rgba(124, 58, 237, 0.08)", "rgba(245, 158, 11, 0.08)")
    return s

for path in glob.glob('src/components/dashboard/*.tsx'):
    src = open(path, encoding='utf8').read()
    out = transform(src)
    if out != src:
        open(path, 'w', encoding='utf8').write(out)
        print('updated', path)
