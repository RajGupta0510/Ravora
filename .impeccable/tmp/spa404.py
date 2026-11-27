p='server.js'
s=open(p,encoding='utf8').read()
a="""    if (req.path.startsWith('/v1')) return next();
    res.sendFile(path.join(distPath, 'index.html'));"""
b="""    if (req.path.startsWith('/v1')) return next();
    // Known client routes answer 200; anything else still gets the app (it renders the 404 page) but with a real 404 status.
    const known = /^\/(auth(\/[\w-]+)?|legal\/[\w-]+|onboarding|dashboard)?\/?$/.test(req.path);
    res.status(known ? 200 : 404).sendFile(path.join(distPath, 'index.html'));"""
assert a in s
open(p,'w',encoding='utf8').write(s.replace(a,b,1))
