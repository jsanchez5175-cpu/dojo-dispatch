# Swaps the SenseiTab function in src/app/page.tsx with the one in newsensei.txt
# Run from your project root:  python swap_sensei.py
import re, sys, shutil, os

PAGE = os.path.join('src','app','page.tsx')
NEW  = 'newsensei.txt'

if not os.path.exists(PAGE):
    sys.exit('ERROR: src/app/page.tsx not found. Run this from your project root (C:\\Users\\jsanc\\dojo-dispatch).')
if not os.path.exists(NEW):
    sys.exit('ERROR: newsensei.txt not found. Put it in the project root next to this script.')

src = open(PAGE, encoding='utf-8').read()
new_fn = open(NEW, encoding='utf-8').read().rstrip() + '\n'

start = src.find('function SenseiTab() {')
if start == -1:
    sys.exit('ERROR: could not find "function SenseiTab() {" in page.tsx')

# The next top-level function after SenseiTab is MetaTab.
end = src.find('function MetaTab()', start)
if end == -1:
    sys.exit('ERROR: could not find "function MetaTab()" after SenseiTab')

# Back up the original
shutil.copy(PAGE, PAGE + '.bak')

# Preserve the blank line(s) between functions: capture whitespace before MetaTab
# We rebuild: [everything before SenseiTab] + new_fn + "\n" + [MetaTab onward]
before = src[:start]
after  = src[end:]

result = before + new_fn + '\n' + after
open(PAGE, 'w', encoding='utf-8').write(result)
print('SUCCESS: SenseiTab replaced. Backup saved as page.tsx.bak')
