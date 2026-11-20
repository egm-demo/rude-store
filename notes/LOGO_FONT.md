# Логотип Кирилла — шрифт (2026-11-20)
Эталон: Downloads/photo_2026-11-19_03-39-54.jpg (THE/RUDE/STORE, по центру, чёрный #090909 на ~#f4f4f4)
Пиксельный IoU (notes/fontscore.py, score_all.txt, fontscore.json): 1) Marcellus Regular +утолщение 0.02em, трекинг 0.07em — 0.735
2) Gillius ADF No2 — 0.709; 3) Alegreya Sans 0.676; Lato/OpenSans ~0.65; URW Classico(Optima) 0.60; Tenor Sans 0.44 (был вчера — неверно).
Overlay notes/overlay.png подтвердил Marcellus.
Геометрия эталона: высота капители ~74px, шаг строк ~91.5px (1.24×cap), ширины THE 197 / RUDE 265 / STORE 315.
ИТОГ в base.css .lg: font Marcellus (fonts/marcellus-latin-400.woff2), -webkit-text-stroke .028em, letter-spacing .075em, line-height .91.
Проверка в Chrome (notes/logotest.png): ширины строк 196/266/318 vs эталон 197/264/314, высота капители 75 vs 74, плотность заливки совпадает (0.32/0.35/0.33).
Оговорка: эталон — фото, похоже на Optima-подобный глиф; Optima-клон Classico дал хуже (0.60). Marcellus — лучший из ~60 проверенных.
