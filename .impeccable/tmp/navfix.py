p='styles.css'
s=open(p,encoding='utf8').read()
a="""  min-width: 64px;
  box-sizing: border-box;
}
"""
assert s.count(a)==1
s=s.replace(a,"""  flex: 1 1 0;
  min-width: 0;
  box-sizing: border-box;
}
.mobile-nav-btn span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 400px) {
  .mobile-nav-btn { padding: 4px 2px; font-size: 9px; }
}
""")
open(p,'w',encoding='utf8').write(s)
