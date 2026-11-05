# DATA-001 — Auditoría de fechas de nacimiento

Fecha de revisión: 2026-11-05. Se recorrieron los 313 registros de `characters.json`. Los perfiles enlazados indican las fechas completas; se priorizó el perfil oficial de XG y se usaron perfiles públicos secundarios para el resto. Los años de lore fueron reemplazados por el año real del artista.

## Resumen

| Métrica | Total |
|---|---:|
| Registros revisados | 313 |
| Con fecha previa | 91 |
| Sin fecha previa | 222 |
| Fecha previa `null` | 0 |
| Artistas y trainees reales identificados | 199 |
| Fechas preservadas (ya correctas) | 51 |
| Fechas agregadas | 114 |
| Años fantásticos reemplazados (retcon) | 34 |
| Otras inconsistencias corregidas | 0 |
| Modificados | 148 |
| Ambiguos / pendientes | 1 |
| Excluidos | 113 |

## Artistas identificados

| Character ID | Artista | Grupo | Fecha anterior | Fecha real | Fecha final | Fuente | Resultado |
|---|---|---|---|---|---|---|---|
| `svt-scoups` | Choi Seungcheol (S.Coups) | SEVENTEEN | 1995-08-08 | 1995-08-08 | 1995-08-08 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-jeonghan` | Yoon Jeonghan | SEVENTEEN | 1995-10-04 | 1995-10-04 | 1995-10-04 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-joshua` | Hong Jisoo (Joshua) | SEVENTEEN | 1995-12-30 | 1995-12-30 | 1995-12-30 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-jun` | Wen Junhui (Jun) | SEVENTEEN | 1996-06-10 | 1996-06-10 | 1996-06-10 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-hoshi` | Kwon Soonyoung (Hoshi) | SEVENTEEN | 1996-06-15 | 1996-06-15 | 1996-06-15 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-wonwoo` | Jeon Wonwoo | SEVENTEEN | 1996-07-17 | 1996-07-17 | 1996-07-17 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-woozi` | Lee Jihoon (Woozi) | SEVENTEEN | 1996-11-22 | 1996-11-22 | 1996-11-22 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-dk` | Lee Seokmin (DK) | SEVENTEEN | 1997-02-18 | 1997-02-18 | 1997-02-18 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-mingyu` | Kim Mingyu | SEVENTEEN | 1997-04-06 | 1997-04-06 | 1997-04-06 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-minghao` | Xu Minghao (The8) | SEVENTEEN | 1997-11-07 | 1997-11-07 | 1997-11-07 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-seungkwan` | Boo Seungkwan | SEVENTEEN | 1998-01-16 | 1998-01-16 | 1998-01-16 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-vernon` | Chwe Hansol (Vernon) | SEVENTEEN | 1998-02-18 | 1998-02-18 | 1998-02-18 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `svt-dino` | Lee Chan (Dino) | SEVENTEEN | 1999-02-11 | 1999-02-11 | 1999-02-11 | [Perfil](https://kprofiles.com/seventeen-members-profile/) | Preservado |
| `skz-bangchan` | Christopher Bang (Bang Chan) | Stray Kids | 1997-10-03 | 1997-10-03 | 1997-10-03 | [Perfil](https://kprofiles.com/stray-kids-members-profile/) | Preservado |
| `skz-leeknow` | Lee Minho (Lee Know) | Stray Kids | 1998-10-25 | 1998-10-25 | 1998-10-25 | [Perfil](https://kprofiles.com/stray-kids-members-profile/) | Preservado |
| `skz-changbin` | Seo Changbin | Stray Kids | 1999-08-11 | 1999-08-11 | 1999-08-11 | [Perfil](https://kprofiles.com/stray-kids-members-profile/) | Preservado |
| `skz-hyunjin` | Hwang Hyunjin | Stray Kids | 2000-03-20 | 2000-03-20 | 2000-03-20 | [Perfil](https://kprofiles.com/stray-kids-members-profile/) | Preservado |
| `skz-han` | Han Jisung (Han) | Stray Kids | 2000-09-14 | 2000-09-14 | 2000-09-14 | [Perfil](https://kprofiles.com/stray-kids-members-profile/) | Preservado |
| `skz-felix` | Felix Lee | Stray Kids | 2000-09-15 | 2000-09-15 | 2000-09-15 | [Perfil](https://kprofiles.com/stray-kids-members-profile/) | Preservado |
| `skz-seungmin` | Kim Seungmin | Stray Kids | 2000-09-22 | 2000-09-22 | 2000-09-22 | [Perfil](https://kprofiles.com/stray-kids-members-profile/) | Preservado |
| `skz-jeongin` | Yang Jeongin (I.N) | Stray Kids | 2001-02-08 | 2001-02-08 | 2001-02-08 | [Perfil](https://kprofiles.com/stray-kids-members-profile/) | Preservado |
| `skz-woojin` | Kim Woojin | Stray Kids | 1997-04-08 | 1997-04-08 | 1997-04-08 | [Perfil](https://kprofiles.com/stray-kids-members-profile/) | Preservado |
| `enha-jungwon` | Yang Jungwon | ENHYPEN | 1904-02-09 | 2004-02-09 | 2004-02-09 | [Perfil](https://kprofiles.com/enhypen-members-profile/) | Retcon |
| `enha-heeseung` | Lee Heeseung | ENHYPEN | 1901-10-15 | 2001-10-15 | 2001-10-15 | [Perfil](https://kprofiles.com/enhypen-members-profile/) | Retcon |
| `enha-jay` | Park Jongseong (Jay) | ENHYPEN | 1902-04-20 | 2002-04-20 | 2002-04-20 | [Perfil](https://kprofiles.com/enhypen-members-profile/) | Retcon |
| `enha-jake` | Sim Jaeyun (Jake) | ENHYPEN | 1902-11-15 | 2002-11-15 | 2002-11-15 | [Perfil](https://kprofiles.com/enhypen-members-profile/) | Retcon |
| `enha-sunghoon` | Park Sunghoon | ENHYPEN | 1902-12-08 | 2002-12-08 | 2002-12-08 | [Perfil](https://kprofiles.com/enhypen-members-profile/) | Retcon |
| `enha-sunoo` | Kim Sunoo | ENHYPEN | 1903-06-24 | 2003-06-24 | 2003-06-24 | [Perfil](https://kprofiles.com/enhypen-members-profile/) | Retcon |
| `enha-niki` | Nishimura Riki (Ni-ki) | ENHYPEN | 1905-12-09 | 2005-12-09 | 2005-12-09 | [Perfil](https://kprofiles.com/enhypen-members-profile/) | Retcon |
| `nct-johnny` | Johnny Suh | NCT / WayV | 1495-02-09 | 1995-02-09 | 1995-02-09 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-taeyong` | Lee Taeyong | NCT / WayV | 0995-07-01 | 1995-07-01 | 1995-07-01 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-yuta` | Nakamoto Yuta | NCT / WayV | 1895-10-26 | 1995-10-26 | 1995-10-26 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-kun` | Qian Kun | NCT / WayV | 1796-01-01 | 1996-01-01 | 1996-01-01 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-doyoung` | Kim Doyoung | NCT / WayV | 1596-02-01 | 1996-02-01 | 1996-02-01 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-ten` | Ten Lee | NCT / WayV | 1596-02-27 | 1996-02-27 | 1996-02-27 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-jaehyun` | Jeong Jaehyun | NCT / WayV | 1597-02-14 | 1997-02-14 | 1997-02-14 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-winwin` | Dong Sicheng (Winwin) | NCT / WayV | 1897-10-28 | 1997-10-28 | 1997-10-28 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-jungwoo` | Kim Jungwoo | NCT / WayV | 1898-02-19 | 1998-02-19 | 1998-02-19 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-lucas` | Wong Yukhei (Lucas) | NCT / WayV | 1899-01-25 | 1999-01-25 | 1999-01-25 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-mark` | Mark Lee | NCT / WayV | 1899-08-02 | 1999-08-02 | 1999-08-02 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-xiaojun` | Xiao Dejun (Xiaojun) | NCT / WayV | 1899-08-08 | 1999-08-08 | 1999-08-08 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-hendery` | Huang Guanheng (Hendery) | NCT / WayV | 1899-09-28 | 1999-09-28 | 1999-09-28 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-renjun` | Huang Renjun | NCT / WayV | 1900-03-23 | 2000-03-23 | 2000-03-23 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-jeno` | Lee Jeno | NCT / WayV | 1900-04-23 | 2000-04-23 | 2000-04-23 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-haechan` | Lee Donghyuck (Haechan) | NCT / WayV | 1500-06-06 | 2000-06-06 | 2000-06-06 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-jaemin` | Na Jaemin | NCT / WayV | 1900-08-13 | 2000-08-13 | 2000-08-13 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-yangyang` | Liu Yangyang | NCT / WayV | 1910-10-10 | 2000-10-10 | 2000-10-10 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-chenle` | Zhong Chenle | NCT / WayV | 1901-11-22 | 2001-11-22 | 2001-11-22 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-jisung` | Park Jisung | NCT / WayV | 1902-02-05 | 2002-02-05 | 2002-02-05 | [Perfil](https://kprofiles.com/nct-members-profile/) | Retcon |
| `nct-sion` | Oh Sion | NCT / WayV | 2002-05-11 | 2002-05-11 | 2002-05-11 | [Perfil](https://kprofiles.com/nct-members-profile/) | Preservado |
| `nct-riku` | Maeda Riku | NCT / WayV | 2003-06-28 | 2003-06-28 | 2003-06-28 | [Perfil](https://kprofiles.com/nct-members-profile/) | Preservado |
| `nct-yushi` | Tokuno Yushi | NCT / WayV | 2004-04-05 | 2004-04-05 | 2004-04-05 | [Perfil](https://kprofiles.com/nct-members-profile/) | Preservado |
| `nct-jaehee` | Kim Daeyoung (Jaehee) | NCT / WayV | 2005-06-21 | 2005-06-21 | 2005-06-21 | [Perfil](https://kprofiles.com/nct-members-profile/) | Preservado |
| `nct-ryo` | Hirose Ryo | NCT / WayV | 2007-08-04 | 2007-08-04 | 2007-08-04 | [Perfil](https://kprofiles.com/nct-members-profile/) | Preservado |
| `nct-sakuya` | Fujinaga Sakuya | NCT / WayV | 2007-11-18 | 2007-11-18 | 2007-11-18 | [Perfil](https://kprofiles.com/nct-members-profile/) | Preservado |
| `enemy-taeil` | Moon Taeil | NCT / WayV | — | 1994-06-14 | 1994-06-14 | [Perfil](https://kprofiles.com/nct-members-profile/) | Completado |
| `andteam-nicholas` | Nicholas Wang | &TEAM | — | 2002-07-09 | 2002-07-09 | [Perfil](https://kprofiles.com/and-team-members-profile/) | Completado |
| `andteam-ej` | EJ (Byun Euijoo) | &TEAM | — | 2002-09-07 | 2002-09-07 | [Perfil](https://kprofiles.com/and-team-members-profile/) | Completado |
| `andteam-fuma` | Murata Fuma | &TEAM | — | 1998-06-29 | 1998-06-29 | [Perfil](https://kprofiles.com/and-team-members-profile/) | Completado |
| `andteam-k` | K (Koga Yudai) | &TEAM | — | 1997-10-21 | 1997-10-21 | [Perfil](https://kprofiles.com/and-team-members-profile/) | Completado |
| `adp-annie` | Annie Moon | ALLDAY PROJECT | — | 2002-01-23 | 2002-01-23 | [Perfil](https://kprofiles.com/allday-project-members-profile/) | Completado |
| `adp-bailey` | Bailey Sok | ALLDAY PROJECT | — | 2004-02-24 | 2004-02-24 | [Perfil](https://kprofiles.com/allday-project-members-profile/) | Completado |
| `adp-tarzzan` | Tarzzan (Lee Chaewon | ALLDAY PROJECT | — | 2002-09-27 | 2002-09-27 | [Perfil](https://kprofiles.com/allday-project-members-profile/) | Completado |
| `adp-woochan` | Jo Woochan | ALLDAY PROJECT | — | 2005-01-20 | 2005-01-20 | [Perfil](https://kprofiles.com/allday-project-members-profile/) | Completado |
| `adp-youngseo` | Lee Youngseo | ALLDAY PROJECT | — | 2005-11-13 | 2005-11-13 | [Perfil](https://kprofiles.com/allday-project-members-profile/) | Completado |
| `astro-eunwoo` | Cha Eunwoo | ASTRO | — | 1997-03-30 | 1997-03-30 | [Perfil](https://kprofiles.com/astro-members-profile/) | Completado |
| `astro-jinjin` | Jinjin (Park Jinwoo) | ASTRO | — | 1996-03-15 | 1996-03-15 | [Perfil](https://kprofiles.com/astro-members-profile/) | Completado |
| `astro-mj` | MJ (Kim Myungjun) | ASTRO | — | 1994-03-05 | 1994-03-05 | [Perfil](https://kprofiles.com/astro-members-profile/) | Completado |
| `astro-moonbin` | Moon Bin | ASTRO | — | 1998-01-26 | 1998-01-26 | [Perfil](https://kprofiles.com/astro-members-profile/) | Completado |
| `astro-rocky` | Rocky (Park Minhyuk | ASTRO | — | 1999-02-25 | 1999-02-25 | [Perfil](https://kprofiles.com/astro-members-profile/) | Completado |
| `astro-sanha` | Yoon Sanha | ASTRO | — | 2000-03-21 | 2000-03-21 | [Perfil](https://kprofiles.com/astro-members-profile/) | Completado |
| `bnd-leehan` | Leehan (Kim Donghyun) | BOYNEXTDOOR | — | 2004-10-20 | 2004-10-20 | [Perfil](https://kprofiles.com/boynextdoor-members-profile/) | Completado |
| `bnd-taesan` | Taesan (Han Dong-min) | BOYNEXTDOOR | — | 2004-08-10 | 2004-08-10 | [Perfil](https://kprofiles.com/boynextdoor-members-profile/) | Completado |
| `ampersone-brian` | Brian Ho | AMPERS&ONE | — | 2002-08-27 | 2002-08-27 | [Perfil](https://kprofiles.com/ampersone-members-profile/) | Completado |
| `ampersone-jiho` | Jiho | AMPERS&ONE | — | 2004-06-10 | 2004-06-10 | [Perfil](https://kprofiles.com/ampersone-members-profile/) | Completado |
| `ateez-hongjoong` | Kim Hongjoong | ATEEZ | 1998-11-07 | 1998-11-07 | 1998-11-07 | [Perfil](https://kprofiles.com/ateez-members-profile/) | Preservado |
| `ateez-jongho` | Choi Jongho | ATEEZ | 2000-10-12 | 2000-10-12 | 2000-10-12 | [Perfil](https://kprofiles.com/ateez-members-profile/) | Preservado |
| `ateez-san` | Choi San | ATEEZ | 1999-07-10 | 1999-07-10 | 1999-07-10 | [Perfil](https://kprofiles.com/ateez-members-profile/) | Preservado |
| `ateez-seonghwa` | Park Seonghwa | ATEEZ | 1998-04-03 | 1998-04-03 | 1998-04-03 | [Perfil](https://kprofiles.com/ateez-members-profile/) | Preservado |
| `ateez-wooyoung` | Jung Wooyoung | ATEEZ | 1999-11-26 | 1999-11-26 | 1999-11-26 | [Perfil](https://kprofiles.com/ateez-members-profile/) | Preservado |
| `ateez-yeosang` | Kang Yeosang | ATEEZ | 1999-06-15 | 1999-06-15 | 1999-06-15 | [Perfil](https://kprofiles.com/ateez-members-profile/) | Preservado |
| `ateez-yunho` | Jeong Yunho | ATEEZ | 1999-03-23 | 1999-03-23 | 1999-03-23 | [Perfil](https://kprofiles.com/ateez-members-profile/) | Preservado |
| `ateez-mingi` | Song Mingi | ATEEZ | 1999-08-09 | 1999-08-09 | 1999-08-09 | [Perfil](https://kprofiles.com/ateez-members-profile/) | Preservado |
| `bts-agust-d` | Agust D | BTS | — | 1993-03-09 | 1993-03-09 | [Perfil](https://kprofiles.com/bts-bangtan-boys-members-profile/) | Completado |
| `bts-v` | V (Kim Taehyung) | BTS | — | 1995-12-30 | 1995-12-30 | [Perfil](https://kprofiles.com/bts-bangtan-boys-members-profile/) | Completado |
| `cortis-james` | James Chao | CORTIS | — | 2005-10-14 | 2005-10-14 | [Perfil](https://kprofiles.com/cortis-members-profile/) | Completado |
| `cortis-juhoon` | Kim Juhoon | CORTIS | — | 2008-01-03 | 2008-01-03 | [Perfil](https://kprofiles.com/cortis-members-profile/) | Completado |
| `cortis-keonho` | Ahn Keonho | CORTIS | — | 2009-02-14 | 2009-02-14 | [Perfil](https://kprofiles.com/cortis-members-profile/) | Completado |
| `cortis-martin` | Martin Jonathan Edwards | CORTIS | — | 2008-03-20 | 2008-03-20 | [Perfil](https://kprofiles.com/cortis-members-profile/) | Completado |
| `cortis-seonghyeon` | Eom Seonghyeon | CORTIS | — | 2009-01-13 | 2009-01-13 | [Perfil](https://kprofiles.com/cortis-members-profile/) | Completado |
| `kiof-natty` | Natty (Anatchaya Suputhipong) | KISS OF LIFE | — | 2002-05-30 | 2002-05-30 | [Perfil](https://kprofiles.com/kiss-of-life-members-profile/) | Completado |
| `katseye-sophia` | Sophia Laforteza | KATSEYE | — | 2002-12-31 | 2002-12-31 | [Perfil](https://kprofiles.com/katseye-members-profile/) | Completado |
| `katseye-daniela` | Daniela Avanzini | KATSEYE | — | 2004-07-01 | 2004-07-01 | [Perfil](https://kprofiles.com/katseye-members-profile/) | Completado |
| `katseye-megan` | Megan Skiendiel | KATSEYE | — | 2006-02-10 | 2006-02-10 | [Perfil](https://kprofiles.com/katseye-members-profile/) | Completado |
| `katseye-manon` | Manon Bannerman | KATSEYE | — | 2002-06-26 | 2002-06-26 | [Perfil](https://kprofiles.com/katseye-members-profile/) | Completado |
| `katseye-lara` | Lara Raj | KATSEYE | — | 2005-11-03 | 2005-11-03 | [Perfil](https://kprofiles.com/katseye-members-profile/) | Completado |
| `katseye-yoonchae` | Jeung Yoonchae | KATSEYE | — | 2007-12-06 | 2007-12-06 | [Perfil](https://kprofiles.com/katseye-members-profile/) | Completado |
| `lsf-yunjin` | Huh Yunjin | LE SSERAFIM | — | 2001-10-08 | 2001-10-08 | [Perfil](https://kprofiles.com/le-sserafim-members-profile/) | Completado |
| `lsf-chaewon` | Kim Chaewon | LE SSERAFIM | — | 2000-08-01 | 2000-08-01 | [Perfil](https://kprofiles.com/le-sserafim-members-profile/) | Completado |
| `lsf-eunchae` | Hong Eunchae | LE SSERAFIM | — | 2006-11-10 | 2006-11-10 | [Perfil](https://kprofiles.com/le-sserafim-members-profile/) | Completado |
| `lsf-kazuha` | Kazuha Nakamura | LE SSERAFIM | — | 2003-08-09 | 2003-08-09 | [Perfil](https://kprofiles.com/le-sserafim-members-profile/) | Completado |
| `lsf-sakura` | Sakura Miyawaki | LE SSERAFIM | — | 1998-03-19 | 1998-03-19 | [Perfil](https://kprofiles.com/le-sserafim-members-profile/) | Completado |
| `lngshot-woojin` | Jung Woojin | LNGSHOT | — | 2008-03-08 | 2008-03-08 | [Perfil](https://kprofiles.com/more-vision-boys-members-profile/) | Completado |
| `lngshot-ryul` | Kim Ryul | LNGSHOT | — | 2006-09-18 | 2006-09-18 | [Perfil](https://kprofiles.com/more-vision-boys-members-profile/) | Completado |
| `lngshot-ohyul` | Kwon Ohyul | LNGSHOT | — | 2006-01-21 | 2006-01-21 | [Perfil](https://kprofiles.com/more-vision-boys-members-profile/) | Completado |
| `lngshot-louis` | Louis Jourdain Lim | LNGSHOT | — | 2010-05-01 | 2010-05-01 | [Perfil](https://kprofiles.com/more-vision-boys-members-profile/) | Completado |
| `ncit-tata` | Tata | SMTR25 / NCIT | — | 2008-04-01 | 2008-04-01 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-hamin` | Hamin | SMTR25 / NCIT | — | 2006-08-05 | 2006-08-05 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-hyunjun` | Hyunjun | SMTR25 / NCIT | — | 2006-02-12 | 2006-02-12 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-nicholas` | Nicholas | SMTR25 / NCIT | — | 2004-12-27 | 2004-12-27 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-haruta` | Haruta | SMTR25 / NCIT | — | 2006-03-05 | 2006-03-05 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-sadaharu` | Sadaharu | SMTR25 / NCIT | — | 2007-09-14 | 2007-09-14 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-charlie` | Charlie | SMTR25 / NCIT | — | 2007-05-26 | 2007-05-26 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-hanbi` | Hanbi | SMTR25 / NCIT | — | 2003-10-24 | 2003-10-24 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-daniel` | Daniel | SMTR25 / NCIT | — | 2005-08-11 | 2005-08-11 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-songha` | Songha | SMTR25 / NCIT | — | 2004-04-19 | 2004-04-19 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-justin` | Justin Jay | SMTR25 / NCIT | — | 2006-01-27 | 2006-01-27 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-kachin` | Kachin | SMTR25 / NCIT | — | 2007-08-03 | 2007-08-03 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-woolin` | Woolin | SMTR25 / NCIT | — | 2008-11-19 | 2008-11-19 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-kassho` | Kassho | SMTR25 / NCIT | — | 2006-01-20 | 2006-01-20 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `ncit-jaewon` | Jaewon | SMTR25 / NCIT | — | 2008-02-16 | 2008-02-16 | [Perfil](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) | Completado |
| `njz-hanni` | Hanni | NewJeans / NJZ | — | 2004-10-06 | 2004-10-06 | [Perfil](https://kprofiles.com/newjeans-members-profile/) | Completado |
| `njz-minji` | Kim Minji | NewJeans / NJZ | — | 2004-05-07 | 2004-05-07 | [Perfil](https://kprofiles.com/newjeans-members-profile/) | Completado |
| `njz-danielle` | Danielle Marsh | NewJeans / NJZ | — | 2005-04-11 | 2005-04-11 | [Perfil](https://kprofiles.com/newjeans-members-profile/) | Completado |
| `njz-hyein` | Hyein | NewJeans / NJZ | — | 2008-04-21 | 2008-04-21 | [Perfil](https://kprofiles.com/newjeans-members-profile/) | Completado |
| `p1h-keeho` | Yoon Keeho | P1Harmony | — | 2001-09-27 | 2001-09-27 | [Perfil](https://kprofiles.com/p1harmony-members-profile/) | Completado |
| `psf-jimmy` | Jimmy | PSYCHIC FEVER | — | 2000-02-26 | 2000-02-26 | [Perfil](https://kprofiles.com/psychic-fever-from-exile-tribe-members-profile/) | Completado |
| `psf-kokoro` | Kokoro | PSYCHIC FEVER | — | 2000-11-09 | 2000-11-09 | [Perfil](https://kprofiles.com/psychic-fever-from-exile-tribe-members-profile/) | Completado |
| `psf-tsurugi` | Tsurugi | PSYCHIC FEVER | — | 1997-04-09 | 1997-04-09 | [Perfil](https://kprofiles.com/psychic-fever-from-exile-tribe-members-profile/) | Completado |
| `psf-weesa` | Weesa | PSYCHIC FEVER | — | 2004-02-26 | 2004-02-26 | [Perfil](https://kprofiles.com/psychic-fever-from-exile-tribe-members-profile/) | Completado |
| `riize-anton` | Anton | RIIZE | 2004-03-21 | 2004-03-21 | 2004-03-21 | [Perfil](https://kprofiles.com/riize-members-profile/) | Preservado |
| `riize-eunseok` | Eunseok | RIIZE | 2001-03-19 | 2001-03-19 | 2001-03-19 | [Perfil](https://kprofiles.com/riize-members-profile/) | Preservado |
| `riize-shotaro` | Shotaro | RIIZE | 2000-11-25 | 2000-11-25 | 2000-11-25 | [Perfil](https://kprofiles.com/riize-members-profile/) | Preservado |
| `riize-sohee` | Sohee | RIIZE | 2003-11-21 | 2003-11-21 | 2003-11-21 | [Perfil](https://kprofiles.com/riize-members-profile/) | Preservado |
| `riize-sungchan` | Sungchan | RIIZE | 2001-09-13 | 2001-09-13 | 2001-09-13 | [Perfil](https://kprofiles.com/riize-members-profile/) | Preservado |
| `riize-wonbin` | Wonbin | RIIZE | 2002-03-02 | 2002-03-02 | 2002-03-02 | [Perfil](https://kprofiles.com/riize-members-profile/) | Preservado |
| `nu-est-baekho` | Baekho | NU’EST | — | 1995-07-21 | 1995-07-21 | [Perfil](https://kprofiles.com/nuest-members-profile/) | Completado |
| `kep1er-bahiyyih` | Bahiyyih | Kep1er | — | 2004-07-27 | 2004-07-27 | [Perfil](https://kprofiles.com/kep1er-members-profile/) | Completado |
| `txt-beomgyu` | Beomgyu | TXT | — | 2001-03-13 | 2001-03-13 | [Perfil](https://kprofiles.com/txt-members-profile/) | Completado |
| `txt-soobin` | Choi Soobin | TXT | — | 2000-12-05 | 2000-12-05 | [Perfil](https://kprofiles.com/txt-members-profile/) | Completado |
| `txt-hueningkai` | Hueningkai | TXT | — | 2002-08-14 | 2002-08-14 | [Perfil](https://kprofiles.com/txt-members-profile/) | Completado |
| `txt-taehyun` | Taehyun | TXT | — | 2002-02-05 | 2002-02-05 | [Perfil](https://kprofiles.com/txt-members-profile/) | Completado |
| `txt-yeonjun` | Yeonjun | TXT | — | 1999-09-13 | 1999-09-13 | [Perfil](https://kprofiles.com/txt-members-profile/) | Completado |
| `twice-dahyun` | Dahyun | TWICE | — | 1998-05-28 | 1998-05-28 | [Perfil](https://kprofiles.com/twice-members-profile/) | Completado |
| `twice-jeongyeon` | Jeongyeon | TWICE | — | 1996-11-01 | 1996-11-01 | [Perfil](https://kprofiles.com/twice-members-profile/) | Completado |
| `twice-mina` | Mina | TWICE | — | 1997-03-24 | 1997-03-24 | [Perfil](https://kprofiles.com/twice-members-profile/) | Completado |
| `viviz-eunha` | Eunha | VIVIZ | — | 1997-05-30 | 1997-05-30 | [Perfil](https://kprofiles.com/viviz-members-profile/) | Completado |
| `viviz-sinb` | SinB | VIVIZ | — | 1998-06-03 | 1998-06-03 | [Perfil](https://kprofiles.com/viviz-members-profile/) | Completado |
| `viviz-umji` | Umji | VIVIZ | — | 1998-08-19 | 1998-08-19 | [Perfil](https://kprofiles.com/viviz-members-profile/) | Completado |
| `bigbang-g-dragon` | G-Dragon | BIGBANG | — | 1988-08-18 | 1988-08-18 | [Perfil](https://kprofiles.com/big-bang-members-profile/) | Completado |
| `enemy-seungri` | SEUNGRI | BIGBANG | — | 1990-12-12 | 1990-12-12 | [Perfil](https://kprofiles.com/big-bang-members-profile/) | Completado |
| `omega-x-hangyeom` | Hangyeom | OMEGA X | — | 1996-07-17 | 1996-07-17 | [Perfil](https://kprofiles.com/omega-x-members-profile/) | Completado |
| `omega-x-hwichan` | Hwichan | OMEGA X | — | 1996-04-18 | 1996-04-18 | [Perfil](https://kprofiles.com/omega-x-members-profile/) | Completado |
| `omega-x-jaehan` | Jaehan | OMEGA X | — | 1995-07-01 | 1995-07-01 | [Perfil](https://kprofiles.com/omega-x-members-profile/) | Completado |
| `omega-x-yechan` | Yechan | OMEGA X | — | 2001-05-14 | 2001-05-14 | [Perfil](https://kprofiles.com/omega-x-members-profile/) | Completado |
| `sj-heechul` | Heechul | Super Junior | — | 1983-07-10 | 1983-07-10 | [Perfil](https://kprofiles.com/super-junior-members-profile/) | Completado |
| `sj-kyuhyun` | Kyuhyun | Super Junior | — | 1988-02-03 | 1988-02-03 | [Perfil](https://kprofiles.com/super-junior-members-profile/) | Completado |
| `sj-shindong` | Shindong | Super Junior | — | 1985-09-28 | 1985-09-28 | [Perfil](https://kprofiles.com/super-junior-members-profile/) | Completado |
| `sj-siwon` | Siwon | Super Junior | — | 1986-04-07 | 1986-04-07 | [Perfil](https://kprofiles.com/super-junior-members-profile/) | Completado |
| `xg-hinata` | Hinata | XG | — | 2002-06-11 | 2002-06-11 | [Perfil](https://xgalx.com/xg/profile/?lang=en) | Completado |
| `xg-jurin` | Jurin  | XG | — | 2002-06-19 | 2002-06-19 | [Perfil](https://xgalx.com/xg/profile/?lang=en) | Completado |
| `xg-juria` | Juria | XG | — | 2004-11-28 | 2004-11-28 | [Perfil](https://xgalx.com/xg/profile/?lang=en) | Completado |
| `xg-maya` | Maya | XG | — | 2005-08-10 | 2005-08-10 | [Perfil](https://xgalx.com/xg/profile/?lang=en) | Completado |
| `xg-chisa` | Chisa | XG | — | 2002-01-17 | 2002-01-17 | [Perfil](https://xgalx.com/xg/profile/?lang=en) | Completado |
| `xg-cocona` | Cocona | XG | — | 2005-12-06 | 2005-12-06 | [Perfil](https://xgalx.com/xg/profile/?lang=en) | Completado |
| `xg-harvey` | Harvey | XG | — | 2002-12-18 | 2002-12-18 | [Perfil](https://xgalx.com/xg/profile/?lang=en) | Completado |
| `mamamoo-hwasa` | Hwasa | MAMAMOO | — | 1995-07-23 | 1995-07-23 | [Perfil](https://kprofiles.com/mamamoo-members-profile/) | Completado |
| `mx-hyungwon` | Chae Hyungwon | MONSTA X | 1494-01-15 | 1994-01-15 | 1994-01-15 | [Perfil](https://kprofiles.com/monsta-x-members-profile/) | Retcon |
| `mx-shownu` | Son Hyunwoo (Shownu) | MONSTA X | 1492-06-18 | 1992-06-18 | 1992-06-18 | [Perfil](https://kprofiles.com/monsta-x-members-profile/) | Retcon |
| `mx-minhyuk` | Lee Minhyuk | MONSTA X | 1493-11-03 | 1993-11-03 | 1993-11-03 | [Perfil](https://kprofiles.com/monsta-x-members-profile/) | Retcon |
| `mx-kihyun` | Yoo Kihyun | MONSTA X | 1493-11-22 | 1993-11-22 | 1993-11-22 | [Perfil](https://kprofiles.com/monsta-x-members-profile/) | Retcon |
| `mx-joohoney` | Lee Jooheon (Joohoney) | MONSTA X | 1494-10-06 | 1994-10-06 | 1994-10-06 | [Perfil](https://kprofiles.com/monsta-x-members-profile/) | Retcon |
| `mx-im` | Im Changkyun (I.M) | MONSTA X | 1496-01-26 | 1996-01-26 | 1996-01-26 | [Perfil](https://kprofiles.com/monsta-x-members-profile/) | Retcon |
| `mx-wonho` | Lee Hoseok (Wonho) | MONSTA X | 1493-03-01 | 1993-03-01 | 1993-03-01 | [Perfil](https://kprofiles.com/monsta-x-members-profile/) | Retcon |
| `got7-jackson` | Jackson Wang | GOT7 | — | 1994-03-28 | 1994-03-28 | [Perfil](https://kprofiles.com/jackson-wang-got7-profile/) | Completado |
| `rv-seulgi` | Seulgi | Red Velvet | — | 1994-02-10 | 1994-02-10 | [Perfil](https://kprofiles.com/red-velvet-members-profile/) | Completado |
| `xnghan-seunghan` | Seunghan | XngHan / ex-RIIZE | — | 2003-10-02 | 2003-10-02 | [Perfil](https://kprofiles.com/seunghan-profile/) | Completado |
| `zb1-ricky` | Ricky | ZEROBASEONE | — | 2004-05-20 | 2004-05-20 | [Perfil](https://kprofiles.com/zerobaseone-members-profile/) | Completado |
| `exo-kai` | Kim Jongin (Kai) | EXO | 1994-01-14 | 1994-01-14 | 1994-01-14 | [Perfil](https://kprofiles.com/exo-members-profile/) | Preservado |
| `exo-chanyeol` | Park Chanyeol | EXO | 1992-11-27 | 1992-11-27 | 1992-11-27 | [Perfil](https://kprofiles.com/exo-members-profile/) | Preservado |
| `exo-kyungsoo` | Do Kyungsoo (D.O.) | EXO | 1993-01-12 | 1993-01-12 | 1993-01-12 | [Perfil](https://kprofiles.com/exo-members-profile/) | Preservado |
| `exo-lay` | Zhang Yixing (Lay) | EXO | 1991-10-07 | 1991-10-07 | 1991-10-07 | [Perfil](https://kprofiles.com/exo-members-profile/) | Preservado |
| `exo-sehun` | Oh Sehun | EXO | 1994-04-12 | 1994-04-12 | 1994-04-12 | [Perfil](https://kprofiles.com/exo-members-profile/) | Preservado |
| `exo-xiumin` | Kim Minseok (Xiumin) | EXO | 1990-03-26 | 1990-03-26 | 1990-03-26 | [Perfil](https://kprofiles.com/exo-members-profile/) | Preservado |
| `exo-suho` | Kim Junmyeon (Suho) | EXO | 1991-05-22 | 1991-05-22 | 1991-05-22 | [Perfil](https://kprofiles.com/exo-members-profile/) | Preservado |
| `exo-baekhyun` | Byun Baekhyun | EXO | 1992-05-06 | 1992-05-06 | 1992-05-06 | [Perfil](https://kprofiles.com/exo-members-profile/) | Preservado |
| `exo-chen` | Kim Jongdae (Chen) | EXO | 1992-09-21 | 1992-09-21 | 1992-09-21 | [Perfil](https://kprofiles.com/exo-members-profile/) | Preservado |
| `enemy-kris` | Mr. Wu | EXO | — | 1990-11-06 | 1990-11-06 | [Perfil](https://kprofiles.com/exo-members-profile/) | Completado |
| `tvxq-yunho` | Yunho | TVXQ | — | 1986-02-06 | 1986-02-06 | [Perfil](https://kprofiles.com/tvxq-members-profile/) | Completado |
| `tvxq-jaejoong` | Jaejoong | TVXQ | — | 1986-01-26 | 1986-01-26 | [Perfil](https://kprofiles.com/tvxq-members-profile/) | Completado |
| `tvxq-junsu` | Junsu | TVXQ | — | 1986-12-15 | 1986-12-15 | [Perfil](https://kprofiles.com/tvxq-members-profile/) | Completado |
| `tvxq-yoochun` | Yoochun | TVXQ | — | 1986-06-04 | 1986-06-04 | [Perfil](https://kprofiles.com/tvxq-members-profile/) | Completado |
| `tvxq-changmin` | Changmin | TVXQ | — | 1988-02-18 | 1988-02-18 | [Perfil](https://kprofiles.com/tvxq-members-profile/) | Completado |
| `solo-ado` | Ado | Ado | — | 2002-10-24 | 2002-10-24 | [Perfil](https://kprofiles.com/ado-profile-facts/) | Completado |
| `solo-eunbi` | Eunbi | Kwon Eunbi / ex-IZ*ONE | — | 1995-09-27 | 1995-09-27 | [Perfil](https://kprofiles.com/kwon-eunbi-profile-facts/) | Completado |

| `wjsn-eunseo` | Eunseo | WJSN | — | 1998-05-27 | 1998-05-27 | [Perfil](https://kprofiles.com/wjsn-cosmic-girls-profile/) | Completado |
| `wjsn-dayoung` | Dayoung | WJSN | — | 1999-05-14 | 1999-05-14 | [Perfil](https://kprofiles.com/wjsn-cosmic-girls-profile/) | Completado |
| `billlie-tsuki` | Tsuki | Billlie | — | 2002-09-21 | 2002-09-21 | [Perfil](https://kprofiles.com/billlie-members-profile/) | Completado |
| `billlie-suhyeon` | Suhyeon | Billlie | — | 2000-01-15 | 2000-01-15 | [Perfil](https://kprofiles.com/billlie-members-profile/) | Completado |

## Categorías de resultado

- **Preservado:** fecha existente igual a la fecha verificada (51).
- **Retcon:** año fantástico sustituido por el año real (34).
- **Completado:** registro sin fecha que ahora tiene fecha verificada (114).
- **Corregido:** otra diferencia entre fecha existente y fuente (0).

## Ambiguos y no verificables

| Character ID | Motivo | Estado |
|---|---|---|
| `npc-chayanne` | Nombre de artista real, pero el registro lo presenta como goblin genérico; identidad no demostrada. | Pendiente; fecha sin cambios |

No quedó ningún artista identificado con fecha no verificable. El registro `nct-baby` es un personaje infantil original, y `npc-minji` y `npc-minsoo` son hijas originales dentro de la facción SVT; su pertenencia a una facción musical no los convierte en idols.

## Registros excluidos

Se excluyeron PCs, NPC originales, personajes de otras franquicias, mascotas, deportistas y figuras sin relación demostrada con la industria idol. IDs sin cambio: `pc-minjae`, `pc-kiyori`, `pc-imugi`, `pc-soobin`, `nct-baby`, `os-asuka`, `os-eris`, `os-lira`, `os-mimira`, `os-lu-yan`, `os-jiwon`, `npc-ario`, `npc-arturo`, `enemy-arven`, `npc-benny`, `npc-biagi`, `npc-brandom-lee`, `npc-bruno`, `actor-byeon-wooseok`, `npc-camerino`, `npc-camerino-jr`, `npc-capitana-lim`, `npc-capitana-merry`, `npc-carlos`, `npc-castro`, `npc-church`, `npc-cristian`, `npc-dj-tony-mix`, `npc-dal`, `enemy-delkhan`, `npc-demetrio`, `npc-don-jose`, `npc-donatella-versace`, `npc-dorian`, `npc-emi`, `enemy-evan`, `npc-felixia`, `npc-gabri`, `npc-hanjun`, `npc-hilario`, `npc-zapo`, `npc-tlanejo`, `npc-rosita`, `npc-petunia`, `npc-dalia`, `npc-margarita`, `npc-hwang`, `npc-jacob`, `npc-jeronimo`, `npc-juanga`, `npc-junho`, `bg3-kar-niss`, `enemy-soohyun`, `npc-kunno`, `npc-lady-isuna`, `npc-lady-myeonghwa`, `npc-leliana`, `enemy-lesath`, `npc-lin-dareum`, `npc-logan`, `npc-lumira`, `npc-lupin`, `npc-mario`, `npc-matsuda`, `npc-mephisto`, `npc-ming-yua`, `npc-misa`, `npc-mitsubishi`, `npc-moai`, `enemy-haneul`, `npc-neorayita`, `npc-omar`, `os-qin-shen-yu`, `npc-ren`, `npc-rio`, `npc-rogelio`, `npc-sae-jong`, `npc-salim`, `npc-sario`, `npc-scrompy-lee`, `npc-sebas`, `bg3-shadowheart`, `npc-sir-baekjin`, `npc-subaru`, `npc-suzuki`, `npc-tencha`, `pet-tere`, `npc-uzari`, `npc-valko`, `npc-xiantao-klau`, `npc-xue-long`, `pet-yeontan`, `npc-yorihiko`, `npc-youngok`, `npc-yui`, `pc-kao`, `t1-zeus`, `t1-doran`, `t1-oner`, `t1-peyz`, `t1-keria`, `t1-faker`, `npc-laura`, `npc-yamal`, `npc-sixsevenaldo`, `npc-minji`, `npc-minsoo`, `npc-abu`, `npc-apu`, `npc-agu`, `pet-bella`, `pet-daegal`, `pet-brownie`.

## Notas de contraste

- El [perfil oficial de XG](https://xgalx.com/xg/profile/?lang=en) confirma el 28 de noviembre de 2004 para Juria; una lista secundaria antigua mostraba el 24 de noviembre.
- [TVXQ](https://kprofiles.com/tvxq-members-profile/) indica para Junsu el 15 de diciembre de 1986 y aclara que sus padres registraron el 1 de enero de 1987. Se guarda el nacimiento real.
- NCIT se relacionó con los [15 trainees de SMTR25](https://www.soompi.com/article/1784937wpp/sm-male-trainee-team-smtr25-to-star-in-new-reality-show) por el elenco, no por el prefijo del ID.
- `enemy-taeil`, `enemy-seungri` y `enemy-kris` se incluyeron como exintegrantes reales de NCT, BIGBANG y EXO.

## Validación técnica

- Los 313 registros conservaron su ID. La migración comprobó que ningún campo distinto de `dateOfBirth` cambió dentro de un personaje.
- Las 199 fechas de artistas identificados usan `YYYY-MM-DD`, representan días válidos y no son futuras. No quedan años fantásticos en estos registros.
- `npm run typecheck`: correcto.
- La compilación de cliente y servidor de Docusaurus terminó. La generación final quedó detenida por enlaces de facciones sin página (`/factions/kobolds-del-valle-del-arrozal`, entre otros), ajenos a este cambio de fechas.
- `npm test`: 38/41; tres fallos preexistentes de normalización de IDs y referencia a `actor-kim-soohyun`.
- `npm run validate:data`: 33 errores de páginas, grupos y referencias ajenos a fechas de nacimiento.
- La ficha compilada de Taeyong muestra `1 de Julio` sin año ni edad. El calendario usa la lista explícita de artistas para omitir la edad que cumplirían; la edad de PCs y personajes originales conserva su cálculo anterior.

La copia local también incluye cuatro artistas de WJSN/Billlie y tres mascotas añadidos después de la auditoría inicial del worktree. Se verificaron las cuatro fechas nuevas; las mascotas quedaron sin cambios.
