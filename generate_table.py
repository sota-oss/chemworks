import json

elements = [
    # Period 1
    (1, "H", "Hiđro", 1, 1, "nonmetal"), (2, "He", "Heli", 1, 18, "noble-gas"),
    # Period 2
    (3, "Li", "Liti", 2, 1, "alkali-metal"), (4, "Be", "Beri", 2, 2, "alkaline-earth"),
    (5, "B", "Bo", 2, 13, "metalloid"), (6, "C", "Cacbon", 2, 14, "nonmetal"),
    (7, "N", "Nitơ", 2, 15, "nonmetal"), (8, "O", "Oxi", 2, 16, "nonmetal"),
    (9, "F", "Flo", 2, 17, "halogen"), (10, "Ne", "Neon", 2, 18, "noble-gas"),
    # Period 3
    (11, "Na", "Natri", 3, 1, "alkali-metal"), (12, "Mg", "Magie", 3, 2, "alkaline-earth"),
    (13, "Al", "Nhôm", 3, 13, "post-transition"), (14, "Si", "Silic", 3, 14, "metalloid"),
    (15, "P", "Photpho", 3, 15, "nonmetal"), (16, "S", "Lưu huỳnh", 3, 16, "nonmetal"),
    (17, "Cl", "Clo", 3, 17, "halogen"), (18, "Ar", "Argon", 3, 18, "noble-gas"),
    # Period 4
    (19, "K", "Kali", 4, 1, "alkali-metal"), (20, "Ca", "Canxi", 4, 2, "alkaline-earth"),
    (21, "Sc", "Scandi", 4, 3, "transition-metal"), (22, "Ti", "Titan", 4, 4, "transition-metal"),
    (23, "V", "Vanadi", 4, 5, "transition-metal"), (24, "Cr", "Crom", 4, 6, "transition-metal"),
    (25, "Mn", "Mangan", 4, 7, "transition-metal"), (26, "Fe", "Sắt", 4, 8, "transition-metal"),
    (27, "Co", "Coban", 4, 9, "transition-metal"), (28, "Ni", "Niken", 4, 10, "transition-metal"),
    (29, "Cu", "Đồng", 4, 11, "transition-metal"), (30, "Zn", "Kẽm", 4, 12, "transition-metal"),
    (31, "Ga", "Gali", 4, 13, "post-transition"), (32, "Ge", "Gemani", 4, 14, "metalloid"),
    (33, "As", "Asen", 4, 15, "metalloid"), (34, "Se", "Selen", 4, 16, "nonmetal"),
    (35, "Br", "Brom", 4, 17, "halogen"), (36, "Kr", "Kripton", 4, 18, "noble-gas"),
    # Period 5
    (37, "Rb", "Rubiđi", 5, 1, "alkali-metal"), (38, "Sr", "Stronti", 5, 2, "alkaline-earth"),
    (39, "Y", "Ytri", 5, 3, "transition-metal"), (40, "Zr", "Zirconi", 5, 4, "transition-metal"),
    (41, "Nb", "Niobi", 5, 5, "transition-metal"), (42, "Mo", "Molipđen", 5, 6, "transition-metal"),
    (43, "Tc", "Tecnexi", 5, 7, "transition-metal"), (44, "Ru", "Ruteni", 5, 8, "transition-metal"),
    (45, "Rh", "Rodi", 5, 9, "transition-metal"), (46, "Pd", "Paladi", 5, 10, "transition-metal"),
    (47, "Ag", "Bạc", 5, 11, "transition-metal"), (48, "Cd", "Cadimi", 5, 12, "transition-metal"),
    (49, "In", "Inđi", 5, 13, "post-transition"), (50, "Sn", "Thiếc", 5, 14, "post-transition"),
    (51, "Sb", "Antimon", 5, 15, "metalloid"), (52, "Te", "Telu", 5, 16, "metalloid"),
    (53, "I", "Iot", 5, 17, "halogen"), (54, "Xe", "Xenon", 5, 18, "noble-gas"),
    # Period 6
    (55, "Cs", "Xesi", 6, 1, "alkali-metal"), (56, "Ba", "Bari", 6, 2, "alkaline-earth"),
    # Lanthanides (57-71)
    (57, "La", "Lantan", 8, 3, "lanthanide"), (58, "Ce", "Xeri", 8, 4, "lanthanide"),
    (59, "Pr", "Prazeodim", 8, 5, "lanthanide"), (60, "Nd", "Neodim", 8, 6, "lanthanide"),
    (61, "Pm", "Prometi", 8, 7, "lanthanide"), (62, "Sm", "Samari", 8, 8, "lanthanide"),
    (63, "Eu", "Europi", 8, 9, "lanthanide"), (64, "Gd", "Gadolini", 8, 10, "lanthanide"),
    (65, "Tb", "Tecbi", 8, 11, "lanthanide"), (66, "Dy", "Điprozi", 8, 12, "lanthanide"),
    (67, "Ho", "Honmi", 8, 13, "lanthanide"), (68, "Er", "Eribi", 8, 14, "lanthanide"),
    (69, "Tm", "Tuli", 8, 15, "lanthanide"), (70, "Yb", "Ytecbi", 8, 16, "lanthanide"),
    (71, "Lu", "Lutexi", 8, 17, "lanthanide"),
    # Period 6 continued
    (72, "Hf", "Hafni", 6, 4, "transition-metal"), (73, "Ta", "Tantan", 6, 5, "transition-metal"),
    (74, "W", "Vonfram", 6, 6, "transition-metal"), (75, "Re", "Reni", 6, 7, "transition-metal"),
    (76, "Os", "Osimi", 6, 8, "transition-metal"), (77, "Ir", "Iridi", 6, 9, "transition-metal"),
    (78, "Pt", "Platin", 6, 10, "transition-metal"), (79, "Au", "Vàng", 6, 11, "transition-metal"),
    (80, "Hg", "Thủy ngân", 6, 12, "transition-metal"), (81, "Tl", "Tali", 6, 13, "post-transition"),
    (82, "Pb", "Chì", 6, 14, "post-transition"), (83, "Bi", "Bitmut", 6, 15, "post-transition"),
    (84, "Po", "Poloni", 6, 16, "post-transition"), (85, "At", "Atatin", 6, 17, "halogen"),
    (86, "Rn", "Radon", 6, 18, "noble-gas"),
    # Period 7
    (87, "Fr", "Franxi", 7, 1, "alkali-metal"), (88, "Ra", "Rađi", 7, 2, "alkaline-earth"),
    # Actinides (89-103)
    (89, "Ac", "Actini", 9, 3, "actinide"), (90, "Th", "Thori", 9, 4, "actinide"),
    (91, "Pa", "Protactini", 9, 5, "actinide"), (92, "U", "Urani", 9, 6, "actinide"),
    (93, "Np", "Neptuni", 9, 7, "actinide"), (94, "Pu", "Plutoni", 9, 8, "actinide"),
    (95, "Am", "Amerixi", 9, 9, "actinide"), (96, "Cm", "Curi", 9, 10, "actinide"),
    (97, "Bk", "Beckeli", 9, 11, "actinide"), (98, "Cf", "Californi", 9, 12, "actinide"),
    (99, "Es", "Ensteni", 9, 13, "actinide"), (100, "Fm", "Fecmi", 9, 14, "actinide"),
    (101, "Md", "Mendelevi", 9, 15, "actinide"), (102, "No", "Nobeli", 9, 16, "actinide"),
    (103, "Lr", "Lorenxi", 9, 17, "actinide"),
    # Period 7 continued
    (104, "Rf", "Rutherfordi", 7, 4, "transition-metal"), (105, "Db", "Đubni", 7, 5, "transition-metal"),
    (106, "Sg", "Seaborgi", 7, 6, "transition-metal"), (107, "Bh", "Bohri", 7, 7, "transition-metal"),
    (108, "Hs", "Hassi", 7, 8, "transition-metal"), (109, "Mt", "Meitneri", 7, 9, "transition-metal"),
    (110, "Ds", "Darmstadti", 7, 10, "transition-metal"), (111, "Rg", "Roentgeni", 7, 11, "transition-metal"),
    (112, "Cn", "Copernixi", 7, 12, "transition-metal"), (113, "Nh", "Nihoni", 7, 13, "post-transition"),
    (114, "Fl", "Flerovi", 7, 14, "post-transition"), (115, "Mc", "Moscovi", 7, 15, "post-transition"),
    (116, "Lv", "Livermori", 7, 16, "post-transition"), (117, "Ts", "Tennessine", 7, 17, "halogen"),
    (118, "Og", "Oganesson", 7, 18, "noble-gas")
]

out = [{"atomicNumber": n, "symbol": s, "name": name, "period": p, "group": g, "category": c} for n, s, name, p, g, c in elements]

with open('src/data/periodicTable.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print("Generated src/data/periodicTable.json successfully.")
