'use client'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import TheClimb from '@/components/TheClimb'
import PunishFinder from '@/components/PunishFinder'
import CharacterDossier from '@/components/CharacterDossier'
import RivalRadar from '@/components/RivalRadar'
import LabPlaylist from '@/components/LabPlaylist'
import FrameFlashcards from '@/components/FrameFlashcards'
import VoiceDebrief from '@/components/VoiceDebrief'
import GhostRival from '@/components/GhostRival'
import CommunityTierList from '@/components/CommunityTierList'
import { initBilling, isPro as checkProStatus, buyPro } from '@/lib/revenuecat'

type TabId = 'newsletter' | 'roster' | 'sensei' | 'climb' | 'punish' | 'challenger' | 'rivals' | 'lab' | 'flashcards' | 'debrief' | 'ghost' | 'tierlist' | 'meta' | 'predictor' | 'quiz' | 'events' | 'players' | 'results'

const TABS = [
  { id: 'newsletter', label: 'Newsletter',  icon: 'ti-news' },
  { id: 'roster',     label: 'Roster',      icon: 'ti-shield' },
  { id: 'sensei',     label: 'AI Sensei',   icon: 'ti-torii' },
  { id: 'climb',      label: 'The Climb',   icon: 'ti-trending-up' },
  { id: 'punish',     label: 'Punish Finder', icon: 'ti-target' },
  { id: 'challenger', label: 'New Challenger', icon: 'ti-user-plus' },
  { id: 'rivals',     label: 'Rival Radar', icon: 'ti-radar-2' },
  { id: 'lab',        label: 'Lab Playlist', icon: 'ti-playlist' },
  { id: 'flashcards', label: 'Flashcards',  icon: 'ti-cards' },
  { id: 'debrief',    label: 'Voice Debrief', icon: 'ti-microphone' },
  { id: 'ghost',      label: 'Ghost Rival', icon: 'ti-ghost' },
  { id: 'tierlist',   label: 'Tier List',   icon: 'ti-stack' },
  { id: 'meta',       label: 'Meta',        icon: 'ti-flame' },
  { id: 'predictor',  label: 'Predictor',   icon: 'ti-bolt' },
  { id: 'quiz',       label: 'Daily Quiz',  icon: 'ti-brain' },
  { id: 'events',     label: 'Events',      icon: 'ti-calendar-event' },
  { id: 'players',    label: 'Players',     icon: 'ti-user-star' },
  { id: 'results',    label: 'Results',     icon: 'ti-trophy' },
] as const

const FIGHTERS = [
  { id:'ryu',      name:'Ryu',       type:'All-rounder',  tier:'A', color:'#185FA5', difficulty:'Beginner',    stats:{power:82,speed:70,range:74,defense:78,combo:68,drive:75}, tags:['Shoto','Denjin','Anti-air'],       profile:'The eternal wanderer. EndingWalker\'s 10-0 SFL run proved Ryu elite in Season 3. Denjin Hadoken now hits 8 times after the June 2025 buff.', lore:'The eternal wanderer seeking the meaning of true strength. Trained under Master Gouken alongside Ken, Ryu travels the world fighting the strongest opponents. His internal battle against the Satsui no Hado defines his journey as much as any tournament result.', s3:'Denjin Hadoken buffed from 5 to 8 hits in June 2025 with doubled projectile speed. Multiple normal move buffs improved his neutral. Now A-tier after being dismissed mid-S2.', topPlayers:'EndingWalker (MOUZ) — 10-0 SFL Season 3', combo:'cr.MP xx DR, st.MP xx Tatsu, SA2', strengths:['Best anti-air','Denjin zoning','Long normals'], weaknesses:['Predictable','Limited mix-up','Specials mostly negative'] },
  { id:'luke',     name:'Luke',      type:'Rush-down',    tier:'S', color:'#E24B4A', difficulty:'Beginner',    stats:{power:90,speed:82,range:68,defense:72,combo:88,drive:85}, tags:['Rush-down','High damage','Sand blast'],profile:'Face of SF6. Punk won EVO 2024 with 10,240 entrants using Luke. Relentless Drive Rush pressure and elite damage. Perpetual S-tier.', lore:'Former military contractor turned street fighter. Luke Sullivan trained in combat sports before entering the underground circuit. Brash, confident, and relentlessly aggressive — he fights purely to prove he\'s the best in the world.', s3:'Minor adjustments to Sand Blast recovery. Drive Rush combos remain elite. Stays S-tier as the safest high-reward character in the game.', topPlayers:'Punk (FlyQuest) — EVO 2024 Champion', combo:'cr.MK xx Sand Blast, DR, st.HP xx Flash Knuckle', strengths:['Exceptional damage','Safe pressure','Drive Rush combos'], weaknesses:['Predictable','Lower defense','Needs DP respect'] },
  { id:'juri',     name:'Juri',      type:'Footsies',     tier:'S', color:'#9933CC', difficulty:'Expert',      stats:{power:76,speed:90,range:80,defense:68,combo:92,drive:88}, tags:['Charge store','Combo heavy','Fast normals'],profile:'Fuhajin charge stores create unique pressure. Highest combo ceiling in the game with lightning-fast footsies.', lore:'South Korean Taekwondo prodigy who fights purely for the thrill of it. Juri Han has no interest in justice — she fights because she loves it. The Feng Shui Engine implanted in her eye lets her store and release ki energy.', s3:'Fuhajin store mechanic refined. Combo routes extended with new cancel options. Rising to S-tier as players master her charge management.', topPlayers:'Multiple Japanese tournament players', combo:'st.HP (Fuhajin stored) xx SA2, juggle extensions', strengths:['Incredible combos','Excellent range','Fast normals'], weaknesses:['Charge management','High execution','Weak reversals'] },
  { id:'ken',      name:'Ken',       type:'Aggressive',   tier:'S', color:'#CC4400', difficulty:'Intermediate',stats:{power:86,speed:85,range:70,defense:70,combo:85,drive:82}, tags:['Shoto','Rekkas','Corner carry'],    profile:'More aggressive than Ryu. Rekka strings and elite corner carry make every knockdown dangerous. Top 3 in the game.', lore:'American martial arts champion and Ryu\'s oldest rival. Ken Masters trained under Gouken but developed his own fiery style emphasizing aggression. Now a family man, he still competes to honor his training.', s3:'Rekka pressure options expanded. Corner carry improved with new route optimizations. Solidly S-tier across all regions.', topPlayers:'One of the most represented characters at every Premier', combo:'cr.MP xx DR, st.MP xx Jinrai Kicks, corner carry', strengths:['Corner carry','High/low mix','Rekka pressure'], weaknesses:['Shorter range','Requires reads','Less consistent neutral'] },
  { id:'cammy',    name:'Cammy',     type:'Speed',        tier:'A', color:'#2A6622', difficulty:'Intermediate',stats:{power:72,speed:95,range:65,defense:68,combo:80,drive:86}, tags:['Vortex','Strike/throw','Speed'],    profile:'Fastest movement in the game. Vortex pressure wins neutral through superior mobility and constant throw threat.', lore:'Former SHADALOO agent turned Interpol operative. Cammy White was one of M. Bison\'s elite Dolls before breaking free. Now she fights to protect those who cannot protect themselves, guided by Delta Red.', s3:'Vortex pressure routes cleaned up. Spiral Arrow safe on block variants added. Remains A-tier with highest movement speed in the game.', topPlayers:'Multiple top 8 appearances at every major', combo:'cr.MK xx Spiral Arrow, DR, st.HP xx SA1', strengths:['Fastest movement','Vortex game','Safe options'], weaknesses:['Lower damage','Shorter limbs','Weak vs fireballs'] },
  { id:'zangief',  name:'Zangief',   type:'Grappler',     tier:'B', color:'#880000', difficulty:'Expert',      stats:{power:98,speed:45,range:72,defense:92,combo:65,drive:70}, tags:['Grappler','SPD','Tank'],            profile:'The Red Cyclone. One SPD shifts entire momentum. High risk, devastating reward. Every step forward is a calculated threat.', lore:'The Red Cyclone of Russia. Zangief wrestles to show the power of the human body, representing his motherland in every fight. His SPD has ended careers. He fears nothing except being considered weak.', s3:'SPD damage adjusted. Armor on certain moves tweaked. Still B-tier but one momentum shift changes everything.', topPlayers:'Nemo — most prominent Zangief player at international level', combo:'cr.HP xx Lariat, SPD on landing', strengths:['Highest damage grabs','Incredible defense','Armor moves'], weaknesses:['Very slow','Loses to fireballs','Must get in'] },
  { id:'kimberly', name:'Kimberly',  type:'Mix-up',       tier:'A', color:'#CC6600', difficulty:'Intermediate',stats:{power:74,speed:92,range:62,defense:66,combo:86,drive:90}, tags:['Ninja','Spray','Mix-up'],          profile:'Ninja toolkit with teleports and spray cans. Layered mix-ups hard to read even with full knowledge.', lore:'Teenage ninja trained under Guy, the Metro City Final Fight hero. Kimberly Jackson blends ninjutsu with her love of 80s hip hop culture, using spray paint cans as weapons. Young, gifted, and fearless.', s3:'Spray can setups expanded. Teleport mix options added. Drive gauge usage refined making combos more accessible.', topPlayers:'Several prominent players on the American circuit', combo:'Sprint cancel mix, spray can setups, j.HP, cr.HP xx SA3', strengths:['Diverse mix-ups','Excellent mobility','Spray setups'], weaknesses:['Needs resources','Average damage','Punishable on errors'] },
  { id:'chunli',   name:'Chun-Li',   type:'Footsies',     tier:'S', color:'#2244AA', difficulty:'Intermediate',stats:{power:78,speed:88,range:82,defense:74,combo:84,drive:87}, tags:['Poke heavy','Kikoken','Chip'],      profile:'Elite poke range and chip damage. Wins neutral from almost any range while building meter constantly.', lore:'The strongest woman in the world and Interpol detective. Chun-Li has fought since SF2 seeking justice for her father\'s death. In SF6 she runs a kung fu school while continuing her investigations.', s3:'Kikoken chip damage improved. Poke range on key normals extended. Established S-tier as the best footsies character in the game.', topPlayers:'Kawano — CC12 representative, multiple CPT appearances', combo:'st.MK xx Kikoken, DR, cr.HP xx SA2', strengths:['Best poke range','Great chip damage','Strong meter gain'], weaknesses:['Modest mix-up','Execution demand','Struggles vs large bodies'] },
  { id:'alex',     name:'Alex',      type:'Grapple/Rush', tier:'B', color:'#3A7A3A', isNew:true, difficulty:'Intermediate',stats:{power:88,speed:68,range:70,defense:82,combo:74,drive:76}, tags:['New','Power Bomb','SF3'],  profile:'Year 3 DLC. Grappler/rush hybrid from SF3 with Power Bomb and Slash Elbow. B-tier with high upside.', lore:'New York street brawler trained by Tom, a former US champion. Alex fights to avenge Tom\'s defeat at the hands of Gill in Street Fighter III. His Power Bomb and Slash Elbow from SF3 are fully intact in SF6.', s3:'Brand new character as of March 17, 2026. B-tier currently with high upside. Meta still developing around his toolkit.', topPlayers:'Still being discovered — watch for breakout players at Combo Breaker 2026', combo:'cr.HP xx Slash Elbow, Power Bomb on landing', strengths:['Corner damage','Armor on EX','Diverse toolkit'], weaknesses:['Limited neutral','Slow to get in','Still being solved'] },
  { id:'guile',    name:'Guile',     type:'Keepaway',     tier:'A', color:'#336699', difficulty:'Intermediate',stats:{power:74,speed:65,range:84,defense:76,combo:72,drive:78}, tags:['Sonic Boom','Charge','Zoner'],      profile:'Sonic Boom wall and Flash Kick anti-air define his neutral. NuckleDu\'s signature character. Textbook defensive SF.', lore:'US Air Force pilot and Charlie Nash\'s best friend. Guile has hunted SHADALOO relentlessly since Charlie\'s death, fighting with a charge-based style that walls out opponents with Sonic Booms.', s3:'Sonic Boom recovery improved slightly. V-Skill options expanded. Remains A-tier as the definitive defensive character.', topPlayers:'NuckleDu — EVO 2016 champion, most renowned Guile player in history', combo:'Sonic Boom, walk forward, cr.HP xx Flash Kick', strengths:['Fireball zoning','Flash Kick anti-air','Defensive play'], weaknesses:['Charge mechanic','Slow movement','Requires patience'] },
  { id:'dhalsim',  name:'Dhalsim',   type:'Zoner',        tier:'C', color:'#CC6600', difficulty:'Expert',      stats:{power:68,speed:55,range:98,defense:60,combo:65,drive:72}, tags:['Yoga fire','Teleport','Range'],     profile:'Longest limbs in the game. Teleport mix and yoga fire create impossible spacing situations.', lore:'Indian yoga master and pacifist warrior. Dhalsim fights to raise money for his village. His yoga allows impossible limb extension and fire breath. He fights with reluctance but devastating effectiveness.', s3:'Teleport mix options refined. Yoga Fire properties adjusted. Still C-tier but uniquely difficult to deal with at high level.', topPlayers:'Fuudo, Itazan — historically prominent Dhalsim players', combo:'Yoga Fire, teleport mix, st.HP punish', strengths:['Longest range','Teleport mix','Unique spacing'], weaknesses:['Fragile','Needs patience','High execution'] },
  { id:'blanka',   name:'Blanka',    type:'Gimmick',      tier:'B', color:'#2A7A2A', difficulty:'Beginner',    stats:{power:80,speed:72,range:68,defense:74,combo:70,drive:74}, tags:['Electric','Blanka-chan','Wild'],    profile:'Wild child from Brazil. Blanka-chan dolls and electric attacks create unique mind games at all levels.', lore:'Jimmy, a boy who crashed in the Brazilian jungle as a child and survived by adapting to nature. Now known as Blanka, he uses electric attacks developed from jungle creatures. His Blanka-chan dolls have become an unlikely merchandise sensation.', s3:'Blanka-chan doll setups adjusted. Electric Thunder frame data tweaked. B-tier with strong gimmick potential at all levels.', topPlayers:'Punkdagod — prominent Blanka player on the American circuit', combo:'Blanka-chan setup, hop mix, st.HP xx SA1', strengths:['Blanka-chan pressure','Electric defense','Surprise factor'], weaknesses:['Predictable normals','Limited neutral','Requires reads'] },
  { id:'ehonda',   name:'E. Honda',  type:'Grappler',     tier:'B', color:'#CC4444', difficulty:'Beginner',    stats:{power:90,speed:55,range:65,defense:85,combo:68,drive:68}, tags:['Headbutt','Sumo','Armor'],         profile:'Armored headbutts eat fireballs. Tanky and consistent. One of the most frustrating characters to face.', lore:'Sumo grand champion Edmond Honda fights to prove sumo is the greatest martial art. His Hundred Hand Slap and Sumo Headbutt are iconic moves known by every fighting game player since SF2.', s3:'Headbutt armor properties adjusted. Sumo Splash range tweaked. B-tier with strong resistance to fireball characters.', topPlayers:'Tachikawa — consistent top Sumo player at Japanese events', combo:'Headbutt cancel, cr.HP xx SA2', strengths:['Armored headbutt','Tanky defense','Consistent damage'], weaknesses:['Limited range','Predictable','Struggles vs top tier'] },
  { id:'deejay',   name:'Dee Jay',   type:'All-rounder',  tier:'C', color:'#CC9900', difficulty:'Intermediate',stats:{power:76,speed:78,range:72,defense:70,combo:78,drive:80}, tags:['Sobat','Dreadnought','Music'],     profile:'Jamaican kickboxer with one of the best Drive Rush neutral games. Underrated due to execution requirements.', lore:'Jamaican kickboxer and music superstar. Dee Jay fights because it fills him with the same joy as music. His Maximum Dynamite and Dreadnought moves bring Caribbean flair to the SF6 roster.', s3:'Sobat kick pressure improved. Drive Rush options expanded. Still C-tier but has genuine top-player potential.', topPlayers:'Still being explored — watch for Dee Jay specialists emerging', combo:'Dreadnought confirm, DR, cr.HP xx SA2', strengths:['Strong Drive Rush','Good footsies','Underestimated'], weaknesses:['High execution','Below avg damage','Complex gameplan'] },
  { id:'manon',    name:'Manon',     type:'Grappler',     tier:'B', color:'#AA44AA', difficulty:'Intermediate',stats:{power:82,speed:68,range:76,defense:72,combo:76,drive:74}, tags:['Medal','Judo','Elegant'],          profile:'French judo champion with medal stacking. Gets scarier with every throw. Unique risk/reward character.', lore:'French supermodel and world judo champion. Manon Legrand fights with classical judo throws that gain power through her medal-stacking mechanic. Every successful throw makes the next one more dangerous.', s3:'Medal scaling adjusted slightly. Judo throw range improved. B-tier with strong potential for players who master medal management.', topPlayers:'Several European players have taken Manon to premier events', combo:'Medal stack setup, throw confirm, SA2', strengths:['Medal scaling','Elegant footsies','Unique mechanic'], weaknesses:['Needs medals','Average neutral','Mediocre without resources'] },
  { id:'marisa',   name:'Marisa',    type:'Heavy',        tier:'B', color:'#886633', difficulty:'Beginner',    stats:{power:95,speed:50,range:74,defense:88,combo:72,drive:72}, tags:['Gladiator','Armor','Power'],       profile:'Italian gladiator with massive damage and armored moves. Highest damage floor in SF6 — every hit hurts.', lore:'Italian jewelry designer and modern gladiator. Marisa draws inspiration from ancient Roman warriors, fighting with overwhelming power and armored attacks. Her damage floor is among the highest in SF6.', s3:'Armor on EX moves adjusted. Damage scaling tweaked. B-tier with the most satisfying punish damage in the game.', topPlayers:'Big Bird — has used Marisa at international events', combo:'Dimachaerus armor counter, cr.HP xx Gladius SA2', strengths:['Huge damage','Armored attacks','Corner presence'], weaknesses:['Very slow','Limited mix-up','Easy to zone'] },
  { id:'jp',       name:'JP',        type:'Zoner',        tier:'C', color:'#553388', difficulty:'Expert',      stats:{power:74,speed:60,range:90,defense:68,combo:80,drive:86}, tags:['Psycho Power','Zoner','Europe'],   profile:'April 2026 startup bug fixed. Tokido plays him in Season 3 believing the character remains dominant.', lore:'Mysterious European billionaire and secret villain. JP controls Psycho Power projections that appear anywhere on screen, making him a uniquely oppressive zoner. His true identity and goals remain hidden.', s3:'Departure: Shadow startup bug fixed April 15, 2026. Projections adjusted. Dropped to C-tier after patch changes. Tokido still believes in him.', topPlayers:'Tokido (REJECT) — switched to JP for Season 3', combo:'Projection setup, Departure cancel, SA3', strengths:['Fullscreen control','Drive Rush options','Unique tools'], weaknesses:['April patch hurt him','Niche game plan','Requires mastery'] },
  { id:'lily',     name:'Lily',      type:'Rush',         tier:'C', color:'#CC5533', difficulty:'Intermediate',stats:{power:76,speed:82,range:64,defense:66,combo:74,drive:82}, tags:['Wind','Tomahawk','Stocks'],        profile:'Wind stock mechanic fuels aggressive rush-down that snowballs with resources. Explosive when loaded.', lore:'Thunderfoot tribe warrior from the American Southwest. Lily fights with twin tomahawks and wind stock energy blessed by her ancestors. Small in stature but fierce in spirit, she channels nature\'s power in every battle.', s3:'Wind stock accumulation adjusted. Drive Rush pressure improved. C-tier but explosive when wind stocks are loaded.', topPlayers:'Still developing — Lily specialists emerging on the American regional circuit', combo:'Wind stock charge, Condor Spire, SA3 finish', strengths:['Wind stock pressure','Aggressive neutral','Good Drive Rush'], weaknesses:['Resource dependent','Limited without stocks','Below avg damage'] },
  { id:'jamie',    name:'Jamie',     type:'Rush',         tier:'C', color:'#3355AA', difficulty:'Expert',      stats:{power:78,speed:80,range:66,defense:68,combo:82,drive:84}, tags:['Drink','Breakdance','Levels'],     profile:'Hong Kong breakdancer who gets dramatically stronger with each drink level. Different character at level 4.', lore:'Hong Kong breakdancer and martial arts prodigy. Jamie Siu practices a drunken kung fu style that literally gets stronger as he drinks during the match. At level 0 he is limited — at level 4 he is terrifying.', s3:'Level 4 power scaling adjusted. Drink mechanic timing tweaked. C-tier at level 0, A-tier at level 4.', topPlayers:'Daigo has experimented with Jamie in exhibition matches', combo:'Level 4: cr.HP xx Getsuga Slash, SA3', strengths:['Level 4 power spike','Unique scaling','Surprising damage'], weaknesses:['Weak at level 0','Risky gameplan','Needs time to ramp'] },
  { id:'rashid',   name:'Rashid',    type:'Speed',        tier:'A', color:'#3388CC', difficulty:'Intermediate',stats:{power:72,speed:92,range:70,defense:66,combo:82,drive:88}, tags:['Wind','Speed','EVO 2023'],         profile:'AngryBird won EVO 2023 with Rashid. Incredible speed and Drive Rush options define his game.', lore:'Middle Eastern prince with wind-based Eagle Wing fighting style. Rashid fights to rescue his kidnapped friend. AngryBird used Rashid to win EVO 2023 — the first SF6 EVO championship in history.', s3:'Wind EX moves adjusted. Parkour mix options refined. A-tier with elite Drive Rush neutral.', topPlayers:'AngryBird — EVO 2023 champion with Rashid', combo:'Whirlwind Shot, DR, cr.HP xx SA2', strengths:['Elite speed','Strong Drive Rush','Versatile toolkit'], weaknesses:['Lower damage','Requires execution','Neutral limiting'] },
  { id:'aki',      name:'AKI',       type:'Zoner',        tier:'C', color:'#AA3388', difficulty:'Expert',      stats:{power:72,speed:78,range:76,defense:64,combo:80,drive:82}, tags:['Poison','Snake','Assassin'],       profile:'Poison-based assassin with venom mechanic. Creates tick damage and mix-up situations with stacked poison.', lore:'Mysterious Chinese assassin who works for JP. AKI fights using snake-based poison techniques, inflicting venom stacks that create unique mix-up situations. Elegant, deadly, calculating.', s3:'Poison stack mechanics refined. Venom pressure options expanded. C-tier with unique ceiling for specialists.', topPlayers:'Still being developed — AKI specialists are emerging slowly', combo:'Venom stack, Serpent Lash, SA3 finish', strengths:['Poison pressure','Unique mechanic','Mix-up potential'], weaknesses:['Low health','Requires setup','Execution heavy'] },
  { id:'ed',       name:'Ed',        type:'Rush-down',    tier:'A', color:'#4455CC', difficulty:'Beginner',    stats:{power:82,speed:84,range:68,defense:72,combo:84,drive:86}, tags:['Psycho Power','Boxing','Simple'],   profile:'Young Psycho Power user with streamlined controls. Easiest high-reward character in SF6.', lore:'Young man rescued from Neo Shadaloo, former Psycho Power test subject. Ed developed boxing techniques that channel Psycho Power without evil intent. Simple inputs make him one of the most accessible high-reward characters.', s3:'Psycho Blitz pressure improved. Drive Rush confirming made easier. A-tier as the best entry point for high-level play.', topPlayers:'Multiple players have won regionals with Ed', combo:'Psycho Blitz DR, st.HP xx Psycho Cannon SA2', strengths:['Simple execution','Strong pressure','Good damage'], weaknesses:['Somewhat linear','Predictable gameplan','Limited defensive options'] },
  { id:'akuma',    name:'Akuma',     type:'Aggressive',   tier:'S', color:'#660022', difficulty:'Expert',      stats:{power:92,speed:86,range:76,defense:64,combo:90,drive:90}, tags:['Satsui no Hado','Demon','SA3'],    profile:'Lowest health but highest damage ceiling. Demon Armageddon SA3 ends rounds instantly. Mastery required.', lore:'Master of the Satsui no Hado and Ryu\'s greatest threat. Akuma killed his own master Gouken and seeks only opponents worthy of his killing intent. The weakest defense in SF6, the highest damage — pure glass cannon.', s3:'Demon Armageddon SA3 properties maintained. Gohadoken pressure routes expanded. S-tier with the most terrifying punish game in SF6.', topPlayers:'Kawano — ran Akuma at CC12, multiple Japanese tournament wins', combo:'Gohadoken, DR, cr.HP xx Sekia Kuretsuha SA2', strengths:['Elite damage','Demon Armageddon SA3','Gohadoken pressure'], weaknesses:['Lowest health','High risk','Requires mastery'] },
  { id:'terry',    name:'Terry',     type:'All-rounder',  tier:'A', color:'#CC3300', difficulty:'Intermediate',stats:{power:84,speed:78,range:72,defense:74,combo:82,drive:82}, tags:['SNK','Power Wave','Fatal Fury'],   profile:'Fatal Fury legend as SF6 DLC. Power Wave and Buster Wolf bring SNK flavor with strong neutral.', lore:'The Legendary Wolf from Fatal Fury. Terry Bogard is SNK\'s most iconic character, brought to SF6 as premium DLC. His Power Wave, Crack Shoot, and Buster Wolf translate perfectly into the SF6 Drive system.', s3:'Brand new as Year 2 DLC. A-tier from launch with strong neutral and consistent damage.', topPlayers:'Multiple players adopting Terry — watch CPT results for breakout performances', combo:'Power Wave, DR, st.HP xx Buster Wolf SA3', strengths:['Strong neutral','Good damage','Power Wave pressure'], weaknesses:['Takes time to master','Some linear strings','SNK adjustment'] },
  { id:'mai',      name:'Mai',       type:'Rush-down',    tier:'A', color:'#CC2244', difficulty:'Intermediate',stats:{power:76,speed:88,range:72,defense:66,combo:84,drive:86}, tags:['SNK','Fan','Kunoichi'],            profile:'SNK kunoichi as SF6 DLC. Fan projectiles and aerial mobility create unique pressure angles.', lore:'Shiranui school kunoichi and SNK fan favorite. Mai Shiranui joins SF6 as premium DLC alongside Terry. Her fan projectiles and aerial combat style bring a unique pressure angle not seen in the base roster.', s3:'Brand new as Year 2 DLC. A-tier with strong air-to-air and fan pressure.', topPlayers:'Gaining traction on regional circuits — watch for Mai specialists', combo:'Kachousen fan, DR, j.HP, cr.HP xx SA2', strengths:['Fan pressure','Air mobility','Mix-up angles'], weaknesses:['Needs practice','Resource dependent','Different from SF chars'] },
  { id:'mbison',   name:'M. Bison',  type:'Rush-down',    tier:'B', color:'#330088', difficulty:'Intermediate',stats:{power:86,speed:76,range:70,defense:74,combo:82,drive:80}, tags:['Psycho Power','Dictator','Return'], profile:'The dictator returns. April 2026 fixed the Psycho Mine bug. Classic Bison pressure with modern tools.', lore:'The Shadaloo Dictator returns. M. Bison uses Psycho Power in its purest destructive form. His Psycho Crusher and Scissor Kicks have terrified players since SF2. His return in SF6 has reignited his legacy.', s3:'Psycho Mine Drive Reversal bug fixed April 15, 2026. Pressure options remain strong. B-tier with classic fundamentals.', topPlayers:'Multiple Bison specialists returning now that he\'s back on the roster', combo:'Psycho Mine setup, DR, cr.HP xx Psycho Crusher SA2', strengths:['Strong pressure','Psycho Power tools','Classic fundamentals'], weaknesses:['Bug nerfed April patch','Corner dependent','Needs reads'] },
  { id:'sagat',    name:'Sagat',     type:'Zoner',        tier:'B', color:'#8B5E3C', difficulty:'Intermediate',stats:{power:88,speed:58,range:86,defense:80,combo:70,drive:74}, tags:['Tiger Shot','Muay Thai','Emperor'], profile:'The Muay Thai Emperor. Tiger Shot walls and Tiger Uppercut anti-air — fundamentals monster.', lore:'The Muay Thai Emperor and former SF1 final boss. Sagat lost his eye to Ryu\'s Shoryuken and carries that scar forever. He fights with brutal Tiger Shots and Tiger Uppercuts that define fundamental fighting game play.', s3:'Tiger Shot properties adjusted. Tiger Uppercut anti-air refined. B-tier as a fundamentals monster for patient players.', topPlayers:'Sagat specialists exist across all regions — historically popular in Thailand and Japan', combo:'Tiger Shot wall, walk forward, cr.HP xx Tiger Uppercut SA1', strengths:['Tiger Shot zoning','Elite anti-air','High damage'], weaknesses:['Slow movement','Charge mechanic','Predictable gameplan'] },
  { id:'ingrid',   name:'Ingrid',    type:'Mix-up',       tier:'C', color:'#D4A017', isNew:true, difficulty:'Intermediate',stats:{power:70,speed:80,range:72,defense:62,combo:78,drive:80}, tags:['New','Sun Goddess','Mobility','Install'], profile:'Just-added Year 3 drop. Sun Shot zoning into acrobatic mix-up, with a power-up install to close rounds. Early data — verify her exact SF6 kit in training mode before trusting any number here.', lore:'The Eternal Goddess of the sun, worshipped for centuries in a hidden valley. Ingrid fights to keep the balance between order and chaos, wielding solar power passed through her bloodline. Her return brings classic teleport mix-ups reimagined for SF6\'s Drive system.', s3:'Added mid Season 3 as the newest DLC drop. Dossier is unverified — the community is still mapping her frame data and true tier placement.', topPlayers:'Still being discovered — first Ingrid specialists will emerge at Combo Breaker and EVO 2026.', combo:'Sun Shot confirm, DR, cr.HP xx install cancel (verify in training mode)', strengths:['Sun Shot zoning','Mobility mix-ups','Install pressure window'], weaknesses:['Unproven tier placement','Install has a clock','Data still unverified'] },
]

const MU: Record<string,Record<string,[number,number]>> = {
  ryu:{luke:[42,58],juri:[45,55],ken:[50,50],cammy:[48,52],zangief:[62,38],kimberly:[51,49],chunli:[47,53],alex:[52,48]},
  luke:{ryu:[58,42],juri:[52,48],ken:[54,46],cammy:[55,45],zangief:[48,52],kimberly:[57,43],chunli:[51,49],alex:[56,44]},
  juri:{ryu:[55,45],luke:[48,52],ken:[50,50],cammy:[53,47],zangief:[40,60],kimberly:[52,48],chunli:[49,51],alex:[54,46]},
  ken:{ryu:[50,50],luke:[46,54],juri:[50,50],cammy:[51,49],zangief:[44,56],kimberly:[50,50],chunli:[48,52],alex:[52,48]},
  cammy:{ryu:[52,48],luke:[45,55],juri:[47,53],ken:[49,51],zangief:[55,45],kimberly:[50,50],chunli:[46,54],alex:[54,46]},
  zangief:{ryu:[38,62],luke:[52,48],juri:[60,40],ken:[56,44],cammy:[45,55],kimberly:[50,50],chunli:[47,53],alex:[50,50]},
  kimberly:{ryu:[49,51],luke:[43,57],juri:[48,52],ken:[50,50],cammy:[50,50],zangief:[50,50],chunli:[47,53],alex:[52,48]},
  chunli:{ryu:[53,47],luke:[49,51],juri:[51,49],ken:[52,48],cammy:[54,46],zangief:[53,47],kimberly:[53,47],alex:[55,45]},
  alex:{ryu:[48,52],luke:[44,56],juri:[46,54],ken:[48,52],cammy:[46,54],zangief:[50,50],kimberly:[48,52],chunli:[45,55]},
}

const SC: Record<string,string> = {power:'#E24B4A',speed:'#F5A623',range:'#00D4FF',defense:'#00FF88',combo:'#D4537E',drive:'#7F77DD'}

const QUIZ_DATA = [
  {q:'Alex launched as SF6\'s third Year 3 character. When?',opts:['January 2026','March 17, 2026','May 2026','December 2025'],ans:1,exp:'Alex launched March 17, 2026 — the third Year 3 DLC fighter.'},
  {q:'What was fixed for JP in the April 15, 2026 patch?',opts:['SA3 damage reduced','Departure: Shadow had unintended faster startup in certain cancels','Fireball removed','Drive Rush cost increased'],ans:1,exp:'Departure: Shadow had unintended 1-frame faster startup when canceled from st.MP, st.HK, cr.LK or cr.MK.'},
  {q:'Drive Impact proximity block — what changed March 2026?',opts:['Removed','Moved from frame 3 to frame 17','Costs 2 bars now','Startup increased'],ans:1,exp:'Proximity block activation moved from frame 3 to frame 17, giving defenders a cleaner reaction window.'},
  {q:'How many hits does Denjin Hadoken deal after June 2025 buff?',opts:['3 hits','5 hits','8 hits','12 hits'],ans:2,exp:'June 2025 buffed Denjin Hadoken from 5 to 8 hits with doubled projectile speed.'},
  {q:'What does Drive Rush cancel add to frame advantage on hit?',opts:['Reduces by 2','Adds roughly +4 frames','Auto crumple','Full invincibility'],ans:1,exp:'Drive Rush cancel adds roughly +4 frames to hit advantage, enabling links like cr.MP xx DR, st.MP.'},
  {q:'What is Capcom\'s direct prize contribution to CPT 2026 Premier winners?',opts:['$50,000','$10,000','$2,000','$0'],ans:2,exp:'Capcom contributes just $2,000 to Premier event winners — causing major FGC backlash in 2026.'},
  {q:'Which CPT 2026 Premier is the first ever held in Australia?',opts:['EVO Japan','Combo Breaker','BAM 16 Melbourne','Capcom Cup 13'],ans:2,exp:'BAM 16 Melbourne starting July 10, 2026 is the first-ever Australian CPT Premier.'},
  {q:'Who won EVO 2023 — the first ever SF6 EVO championship?',opts:['Punk','MenaRD','Tokido','AngryBird'],ans:3,exp:'AngryBird won EVO 2023 with Rashid, becoming the first-ever SF6 EVO champion.'},
]

const PLAYER_PORTRAITS: Record<string,string> = {
  endingwalker:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ewg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0d1a2e"/><stop offset="100%" stop-color="#1a2a44"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#ewg)"/><circle cx="60" cy="40" r="22" fill="#c8a882"/><rect x="28" y="58" width="64" height="44" rx="8" fill="#1a3a6a"/><rect x="14" y="62" width="18" height="32" rx="6" fill="#1a3a6a"/><rect x="88" y="62" width="18" height="32" rx="6" fill="#1a3a6a"/><rect x="32" y="59" width="56" height="7" rx="2" fill="#2a5a9a"/><circle cx="60" cy="30" r="10" fill="#c8a882"/><rect x="44" y="18" width="32" height="12" rx="3" fill="#c8a070"/><text x="60" y="113" text-anchor="middle" font-family="Arial" font-size="8" font-weight="700" fill="#00D4FF">MOUZ · GERMANY</text><circle cx="102" cy="18" r="7" fill="#00D4FF" opacity="0.5"/><circle cx="102" cy="18" r="3" fill="#00D4FF"/></svg>`,
  punk:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pkg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a0a0a"/><stop offset="100%" stop-color="#2a1010"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#pkg)"/><circle cx="60" cy="40" r="22" fill="#d4a574"/><rect x="26" y="58" width="68" height="44" rx="8" fill="#1a1a1a"/><rect x="12" y="62" width="18" height="32" rx="6" fill="#1a1a1a"/><rect x="90" y="62" width="18" height="32" rx="6" fill="#1a1a1a"/><rect x="30" y="59" width="60" height="7" rx="2" fill="#E24B4A"/><rect x="12" y="76" width="18" height="6" rx="2" fill="#d4a574"/><rect x="90" y="76" width="18" height="6" rx="2" fill="#d4a574"/><circle cx="60" cy="30" r="10" fill="#d4a574"/><rect x="40" y="18" width="40" height="12" rx="3" fill="#d4a574"/><rect x="16" y="100" width="88" height="14" rx="3" fill="#E24B4A"/><text x="60" y="111" text-anchor="middle" font-family="Arial" font-size="8" font-weight="900" fill="#fff">EVO 2024 CHAMPION</text></svg>`,
  tokido:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tkg" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#0a0a1a"/><stop offset="100%" stop-color="#1a0a2e"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#tkg)"/><circle cx="60" cy="40" r="22" fill="#c8a070"/><rect x="26" y="58" width="68" height="44" rx="8" fill="#111122"/><rect x="12" y="62" width="18" height="32" rx="6" fill="#111122"/><rect x="90" y="62" width="18" height="32" rx="6" fill="#111122"/><rect x="30" y="59" width="60" height="7" rx="2" fill="#6633AA"/><circle cx="60" cy="30" r="10" fill="#c8a070"/><rect x="40" y="18" width="40" height="12" rx="3" fill="#c8a070"/><circle cx="18" cy="18" r="9" fill="#9933CC" opacity="0.3"/><circle cx="102" cy="18" r="9" fill="#9933CC" opacity="0.3"/><circle cx="18" cy="18" r="4" fill="#9933CC" opacity="0.7"/><circle cx="102" cy="18" r="4" fill="#9933CC" opacity="0.7"/><text x="60" y="113" text-anchor="middle" font-family="Arial" font-size="8" font-weight="700" fill="#9933CC">REJECT · JAPAN</text></svg>`,
  menard:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mng" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0a1400"/><stop offset="100%" stop-color="#1a2800"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#mng)"/><circle cx="60" cy="40" r="22" fill="#8B5E3C"/><rect x="26" y="58" width="68" height="44" rx="8" fill="#1a2a00"/><rect x="12" y="62" width="18" height="32" rx="6" fill="#1a2a00"/><rect x="90" y="62" width="18" height="32" rx="6" fill="#1a2a00"/><rect x="30" y="59" width="60" height="7" rx="2" fill="#F5A623"/><circle cx="60" cy="30" r="10" fill="#8B5E3C"/><rect x="40" y="18" width="40" height="12" rx="3" fill="#8B5E3C"/><rect x="16" y="100" width="88" height="14" rx="3" fill="#F5A623"/><text x="60" y="111" text-anchor="middle" font-family="Arial" font-size="8" font-weight="900" fill="#000">EVO 2025 CHAMPION</text></svg>`,
  daigo:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="dgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0a0a0a"/><stop offset="100%" stop-color="#1a0000"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#dgg)"/><rect x="0" y="0" width="120" height="4" fill="#cc2200" opacity="0.8"/><rect x="0" y="116" width="120" height="4" fill="#cc2200" opacity="0.8"/><circle cx="60" cy="40" r="22" fill="#c8a070"/><rect x="26" y="58" width="68" height="44" rx="8" fill="#0a0a0a"/><rect x="12" y="62" width="18" height="32" rx="6" fill="#0a0a0a"/><rect x="90" y="62" width="18" height="32" rx="6" fill="#0a0a0a"/><rect x="30" y="59" width="60" height="7" rx="2" fill="#cc2200"/><circle cx="60" cy="30" r="10" fill="#c8a070"/><rect x="38" y="16" width="44" height="14" rx="3" fill="#c8a070"/><path d="M5 55 Q15 45 25 55 Q15 65 5 55" fill="#cc2200" opacity="0.5"/><path d="M95 55 Q105 45 115 55 Q105 65 95 55" fill="#cc2200" opacity="0.5"/><text x="60" y="113" text-anchor="middle" font-family="Arial" font-size="8" font-weight="700" fill="#cc2200">THE BEAST · JAPAN</text></svg>`,
  justinwong:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="jwg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#001a33"/><stop offset="100%" stop-color="#002a44"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#jwg)"/><circle cx="60" cy="40" r="22" fill="#c8a882"/><rect x="26" y="58" width="68" height="44" rx="8" fill="#001a33"/><rect x="12" y="62" width="18" height="32" rx="6" fill="#001a33"/><rect x="90" y="62" width="18" height="32" rx="6" fill="#001a33"/><rect x="30" y="59" width="60" height="7" rx="2" fill="#0066cc"/><circle cx="60" cy="30" r="10" fill="#c8a882"/><rect x="40" y="18" width="40" height="12" rx="3" fill="#c8a882"/><rect x="12" y="78" width="18" height="6" rx="2" fill="#c8a882"/><rect x="90" y="78" width="18" height="6" rx="2" fill="#c8a882"/><rect x="48" y="0" width="24" height="5" rx="2" fill="#0066cc" opacity="0.6"/><text x="60" y="113" text-anchor="middle" font-family="Arial" font-size="8" font-weight="700" fill="#0066cc">NEW YORK · 8x EVO</text></svg>`,
  angrybird:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="abg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#001a0a"/><stop offset="100%" stop-color="#002a14"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#abg)"/><circle cx="60" cy="40" r="22" fill="#8B5E3C"/><rect x="26" y="58" width="68" height="44" rx="8" fill="#001a0a"/><rect x="12" y="62" width="18" height="32" rx="6" fill="#001a0a"/><rect x="90" y="62" width="18" height="32" rx="6" fill="#001a0a"/><rect x="30" y="59" width="60" height="7" rx="2" fill="#00aa44"/><circle cx="60" cy="30" r="10" fill="#8B5E3C"/><rect x="40" y="18" width="40" height="12" rx="3" fill="#8B5E3C"/><rect x="16" y="100" width="88" height="14" rx="3" fill="#00aa44"/><text x="60" y="111" text-anchor="middle" font-family="Arial" font-size="8" font-weight="900" fill="#fff">EVO 2023 CHAMPION</text></svg>`,
  nuckledu:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ndg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0a1422"/><stop offset="100%" stop-color="#1a2a3a"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#ndg)"/><circle cx="60" cy="40" r="22" fill="#d4a574"/><rect x="26" y="58" width="68" height="44" rx="8" fill="#1a3a1a"/><rect x="12" y="62" width="18" height="32" rx="6" fill="#1a3a1a"/><rect x="90" y="62" width="18" height="32" rx="6" fill="#1a3a1a"/><rect x="30" y="59" width="60" height="7" rx="2" fill="#4a7a4a"/><circle cx="60" cy="30" r="10" fill="#d4a574"/><rect x="38" y="17" width="44" height="14" rx="3" fill="#d4a574"/><text x="60" y="113" text-anchor="middle" font-family="Arial" font-size="8" font-weight="700" fill="#4a7a4a">EVO 2016 CHAMP</text></svg>`,
  sahara:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="shg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a1400"/><stop offset="100%" stop-color="#2a2200"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#shg)"/><circle cx="60" cy="40" r="22" fill="#c8a070"/><rect x="26" y="58" width="68" height="44" rx="8" fill="#1a1400"/><rect x="12" y="62" width="18" height="32" rx="6" fill="#1a1400"/><rect x="90" y="62" width="18" height="32" rx="6" fill="#1a1400"/><rect x="30" y="59" width="60" height="7" rx="2" fill="#F5A623"/><circle cx="60" cy="30" r="10" fill="#c8a070"/><rect x="40" y="18" width="40" height="12" rx="3" fill="#c8a070"/><rect x="16" y="100" width="88" height="14" rx="3" fill="#F5A623"/><text x="60" y="111" text-anchor="middle" font-family="Arial" font-size="8" font-weight="900" fill="#000">CC12 CHAMPION</text></svg>`,
  kawano:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="kwg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#001420"/><stop offset="100%" stop-color="#002438"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#kwg)"/><circle cx="60" cy="40" r="22" fill="#c8a070"/><rect x="26" y="58" width="68" height="44" rx="8" fill="#001420"/><rect x="12" y="62" width="18" height="32" rx="6" fill="#001420"/><rect x="90" y="62" width="18" height="32" rx="6" fill="#001420"/><rect x="30" y="59" width="60" height="7" rx="2" fill="#00D4FF"/><circle cx="60" cy="30" r="10" fill="#c8a070"/><rect x="40" y="18" width="40" height="12" rx="3" fill="#c8a070"/><text x="60" y="113" text-anchor="middle" font-family="Arial" font-size="8" font-weight="700" fill="#00D4FF">CC12 TOP 8 · JAPAN</text></svg>`,
  nemo:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="nmg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a0000"/><stop offset="100%" stop-color="#2a0a0a"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#nmg)"/><circle cx="60" cy="40" r="22" fill="#d4a882"/><rect x="24" y="58" width="72" height="44" rx="8" fill="#1a0000"/><rect x="10" y="62" width="20" height="32" rx="6" fill="#1a0000"/><rect x="90" y="62" width="20" height="32" rx="6" fill="#1a0000"/><rect x="28" y="59" width="64" height="7" rx="2" fill="#880000"/><circle cx="60" cy="30" r="10" fill="#d4a882"/><rect x="40" y="18" width="40" height="12" rx="3" fill="#d4a882"/><text x="60" y="113" text-anchor="middle" font-family="Arial" font-size="8" font-weight="700" fill="#cc4444">GRAPPLER · KOREA</text></svg>`,
  fuudo:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fdg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a0f00"/><stop offset="100%" stop-color="#2a1a00"/></linearGradient></defs><rect width="120" height="120" rx="4" fill="url(#fdg)"/><circle cx="60" cy="40" r="22" fill="#c8a070"/><rect x="26" y="58" width="68" height="44" rx="8" fill="#1a0f00"/><rect x="12" y="62" width="18" height="32" rx="6" fill="#1a0f00"/><rect x="90" y="62" width="18" height="32" rx="6" fill="#1a0f00"/><rect x="30" y="59" width="60" height="7" rx="2" fill="#CC6600"/><circle cx="60" cy="30" r="10" fill="#c8a070"/><rect x="40" y="18" width="40" height="12" rx="3" fill="#c8a070"/><text x="60" y="113" text-anchor="middle" font-family="Arial" font-size="8" font-weight="700" fill="#CC6600">DHALSIM VETERAN</text></svg>`,
}

const AVT: Record<string,string> = {
  ryu:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a2744"/><ellipse cx="36" cy="22" rx="9" ry="10" fill="#c8a882"/><rect x="20" y="30" width="32" height="22" rx="6" fill="#cc2200"/><rect x="16" y="30" width="8" height="16" rx="4" fill="#cc2200"/><rect x="48" y="30" width="8" height="16" rx="4" fill="#cc2200"/><rect x="10" y="44" width="12" height="5" rx="2" fill="#f0f0f0"/><rect x="50" y="44" width="12" height="5" rx="2" fill="#f0f0f0"/><rect x="24" y="52" width="10" height="14" rx="3" fill="#2244aa"/><rect x="38" y="52" width="10" height="14" rx="3" fill="#2244aa"/><rect x="28" y="31" width="16" height="3" rx="1" fill="#aa1100"/><rect x="25" y="18" width="22" height="5" rx="2" fill="#f0f0f0"/><circle cx="36" cy="14" r="4" fill="#c8a882"/></svg>`,
  luke:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a1a2e"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#d4a574"/><rect x="19" y="30" width="34" height="22" rx="5" fill="#2a2a2a"/><rect x="15" y="30" width="9" height="18" rx="4" fill="#2a2a2a"/><rect x="48" y="30" width="9" height="18" rx="4" fill="#2a2a2a"/><rect x="8" y="42" width="13" height="6" rx="3" fill="#d4a574"/><rect x="51" y="42" width="13" height="6" rx="3" fill="#d4a574"/><rect x="22" y="31" width="28" height="4" rx="2" fill="#E24B4A"/><rect x="27" y="14" width="18" height="8" rx="2" fill="#d4a574"/></svg>`,
  juri:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a0a2e"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#c8a882"/><rect x="21" y="30" width="30" height="20" rx="5" fill="#6622aa"/><rect x="17" y="30" width="9" height="16" rx="4" fill="#6622aa"/><rect x="46" y="30" width="9" height="16" rx="4" fill="#6622aa"/><rect x="11" y="40" width="12" height="5" rx="2" fill="#c8a882"/><rect x="49" y="40" width="12" height="5" rx="2" fill="#c8a882"/><ellipse cx="36" cy="14" rx="8" ry="4" fill="#c8a882"/></svg>`,
  ken:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a1000"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#c8a050"/><rect x="20" y="30" width="32" height="22" rx="5" fill="#cc4400"/><rect x="15" y="30" width="9" height="16" rx="4" fill="#cc4400"/><rect x="48" y="30" width="9" height="16" rx="4" fill="#cc4400"/><rect x="9" y="42" width="12" height="6" rx="3" fill="#f0f0f0"/><rect x="51" y="42" width="12" height="6" rx="3" fill="#f0f0f0"/><path d="M27 12 Q36 6 45 12 Q44 18 36 20 Q28 18 27 12Z" fill="#d4a030"/></svg>`,
  cammy:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a1a0a"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#d4a882"/><rect x="21" y="30" width="30" height="20" rx="5" fill="#2a6622"/><rect x="17" y="30" width="9" height="15" rx="4" fill="#2a6622"/><rect x="46" y="30" width="9" height="15" rx="4" fill="#2a6622"/><rect x="11" y="40" width="12" height="5" rx="2" fill="#d4a882"/><rect x="49" y="40" width="12" height="5" rx="2" fill="#d4a882"/><circle cx="36" cy="13" r="5" fill="#d4a882"/></svg>`,
  zangief:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a0a2a"/><ellipse cx="36" cy="20" rx="12" ry="11" fill="#b07060"/><rect x="14" y="30" width="44" height="26" rx="6" fill="#880000"/><rect x="8" y="30" width="11" height="20" rx="5" fill="#880000"/><rect x="53" y="30" width="11" height="20" rx="5" fill="#880000"/><rect x="6" y="44" width="14" height="6" rx="3" fill="#b07060"/><rect x="52" y="44" width="14" height="6" rx="3" fill="#b07060"/><circle cx="36" cy="10" r="5" fill="#b07060"/></svg>`,
  kimberly:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a1422"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#8B5E3C"/><rect x="21" y="30" width="30" height="20" rx="5" fill="#cc6600"/><rect x="16" y="30" width="9" height="16" rx="4" fill="#cc6600"/><rect x="47" y="30" width="9" height="16" rx="4" fill="#cc6600"/><rect x="10" y="40" width="12" height="5" rx="2" fill="#8B5E3C"/><rect x="50" y="40" width="12" height="5" rx="2" fill="#8B5E3C"/><circle cx="36" cy="12" r="5" fill="#8B5E3C"/></svg>`,
  chunli:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a1a2a"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#d4a882"/><rect x="21" y="30" width="30" height="20" rx="5" fill="#2244aa"/><rect x="17" y="30" width="9" height="15" rx="4" fill="#2244aa"/><rect x="46" y="30" width="9" height="15" rx="4" fill="#2244aa"/><rect x="11" y="40" width="12" height="5" rx="2" fill="#d4a882"/><rect x="49" y="40" width="12" height="5" rx="2" fill="#d4a882"/><circle cx="26" cy="13" r="6" fill="#ffcc00"/><circle cx="46" cy="13" r="6" fill="#ffcc00"/><circle cx="36" cy="17" r="5" fill="#d4a882"/></svg>`,
  alex:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a1a10"/><ellipse cx="36" cy="20" rx="10" ry="11" fill="#c8a070"/><rect x="17" y="30" width="38" height="24" rx="5" fill="#2a4a2a"/><rect x="11" y="30" width="11" height="18" rx="5" fill="#2a4a2a"/><rect x="50" y="30" width="11" height="18" rx="5" fill="#2a4a2a"/><rect x="7" y="40" width="14" height="8" rx="3" fill="#c8a070"/><rect x="51" y="40" width="14" height="8" rx="3" fill="#c8a070"/><rect x="26" y="12" width="20" height="8" rx="2" fill="#c8a070"/><circle cx="36" cy="10" r="5" fill="#c8a070"/></svg>`,
  guile:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a1422"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#d4a574"/><rect x="20" y="30" width="32" height="22" rx="5" fill="#2a4a2a"/><rect x="16" y="30" width="9" height="16" rx="4" fill="#2a4a2a"/><rect x="47" y="30" width="9" height="16" rx="4" fill="#2a4a2a"/><rect x="10" y="43" width="13" height="5" rx="2" fill="#d4a574"/><rect x="49" y="43" width="13" height="5" rx="2" fill="#d4a574"/><rect x="22" y="11" width="28" height="12" rx="2" fill="#d4a574"/></svg>`,
  dhalsim:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a0a00"/><ellipse cx="36" cy="20" rx="8" ry="9" fill="#8B5E1C"/><rect x="22" y="28" width="28" height="18" rx="4" fill="#cc6600"/><rect x="4" y="28" width="20" height="10" rx="3" fill="#8B5E1C"/><rect x="48" y="28" width="20" height="10" rx="3" fill="#8B5E1C"/><circle cx="36" cy="12" r="6" fill="#8B5E1C"/></svg>`,
  blanka:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a2200"/><ellipse cx="36" cy="22" rx="12" ry="11" fill="#2a8a2a"/><rect x="16" y="30" width="40" height="24" rx="5" fill="#228822"/><rect x="8" y="34" width="14" height="16" rx="4" fill="#228822"/><rect x="50" y="34" width="14" height="16" rx="4" fill="#228822"/></svg>`,
  ehonda:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a0a1a"/><ellipse cx="36" cy="20" rx="14" ry="13" fill="#e8c090"/><rect x="12" y="30" width="48" height="28" rx="5" fill="#1a1a6a"/><rect x="4" y="34" width="16" height="20" rx="5" fill="#1a1a6a"/><rect x="52" y="34" width="16" height="20" rx="5" fill="#1a1a6a"/></svg>`,
  deejay:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a0a00"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#8B5E3C"/><rect x="20" y="30" width="32" height="22" rx="5" fill="#cc9900"/><rect x="16" y="30" width="9" height="16" rx="4" fill="#cc9900"/><rect x="47" y="30" width="9" height="16" rx="4" fill="#cc9900"/><circle cx="36" cy="13" r="5" fill="#8B5E3C"/></svg>`,
  manon:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a0a1a"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#d4c0a0"/><rect x="21" y="30" width="30" height="20" rx="5" fill="#ddeeff" opacity="0.9"/><rect x="17" y="30" width="9" height="15" rx="4" fill="#ddeeff" opacity="0.9"/><rect x="46" y="30" width="9" height="15" rx="4" fill="#ddeeff" opacity="0.9"/><circle cx="36" cy="13" r="5" fill="#d4c0a0"/><circle cx="48" cy="8" r="4" fill="#FFD700"/></svg>`,
  marisa:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a0a0a"/><ellipse cx="36" cy="20" rx="13" ry="12" fill="#c8a070"/><rect x="12" y="28" width="48" height="28" rx="5" fill="#886633"/><rect x="4" y="32" width="16" height="22" rx="5" fill="#886633"/><rect x="52" y="32" width="16" height="22" rx="5" fill="#886633"/><circle cx="36" cy="12" r="6" fill="#c8a070"/></svg>`,
  jp:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a001a"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#c8c0d8"/><rect x="20" y="30" width="32" height="22" rx="5" fill="#1a0033"/><rect x="16" y="30" width="9" height="16" rx="4" fill="#1a0033"/><rect x="47" y="30" width="9" height="16" rx="4" fill="#1a0033"/><circle cx="36" cy="13" r="5" fill="#c8c0d8"/></svg>`,
  lily:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a0a00"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#8B5E3C"/><rect x="21" y="30" width="30" height="20" rx="5" fill="#cc5533"/><rect x="17" y="30" width="9" height="15" rx="4" fill="#cc5533"/><rect x="46" y="30" width="9" height="15" rx="4" fill="#cc5533"/><circle cx="36" cy="13" r="5" fill="#8B5E3C"/></svg>`,
  jamie:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#001433"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#c8a882"/><rect x="20" y="30" width="32" height="22" rx="5" fill="#3355aa"/><rect x="16" y="30" width="9" height="16" rx="4" fill="#3355aa"/><rect x="47" y="30" width="9" height="16" rx="4" fill="#3355aa"/><circle cx="36" cy="13" r="5" fill="#c8a882"/></svg>`,
  rashid:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#001422"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#d4b090"/><rect x="20" y="30" width="32" height="22" rx="5" fill="#ddeeff" opacity="0.9"/><rect x="16" y="30" width="9" height="16" rx="4" fill="#ddeeff" opacity="0.9"/><rect x="47" y="30" width="9" height="16" rx="4" fill="#ddeeff" opacity="0.9"/><circle cx="36" cy="13" r="5" fill="#d4b090"/></svg>`,
  aki:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a001a"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#e8e0f0"/><rect x="21" y="30" width="30" height="20" rx="5" fill="#220033"/><rect x="17" y="30" width="9" height="16" rx="4" fill="#220033"/><rect x="46" y="30" width="9" height="16" rx="4" fill="#220033"/><circle cx="36" cy="13" r="5" fill="#e8e0f0"/></svg>`,
  ed:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a0a2a"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#d4b882"/><rect x="20" y="30" width="32" height="22" rx="5" fill="#1a1a44"/><rect x="16" y="30" width="9" height="16" rx="4" fill="#1a1a44"/><rect x="47" y="30" width="9" height="16" rx="4" fill="#1a1a44"/><rect x="8" y="40" width="14" height="6" rx="3" fill="#4455cc"/><rect x="50" y="40" width="14" height="6" rx="3" fill="#4455cc"/><circle cx="36" cy="13" r="5" fill="#d4b882"/></svg>`,
  akuma:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a0000"/><ellipse cx="36" cy="21" rx="10" ry="11" fill="#8B3030"/><rect x="18" y="30" width="36" height="24" rx="5" fill="#440000"/><rect x="12" y="30" width="12" height="18" rx="4" fill="#440000"/><rect x="48" y="30" width="12" height="18" rx="4" fill="#440000"/><rect x="6" y="40" width="14" height="6" rx="3" fill="#8B3030"/><rect x="52" y="40" width="14" height="6" rx="3" fill="#8B3030"/><path d="M24 12 Q36 4 48 12 Q44 20 36 22 Q28 20 24 12Z" fill="#cc4400"/><circle cx="28" cy="18" r="3" fill="#ff0000" opacity="0.8"/><circle cx="44" cy="18" r="3" fill="#ff0000" opacity="0.8"/></svg>`,
  terry:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a0000"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#d4a574"/><rect x="20" y="30" width="32" height="22" rx="5" fill="#cc3300"/><rect x="16" y="30" width="9" height="16" rx="4" fill="#cc3300"/><rect x="47" y="30" width="9" height="16" rx="4" fill="#cc3300"/><rect x="8" y="42" width="14" height="6" rx="3" fill="#d4a574"/><rect x="50" y="42" width="14" height="6" rx="3" fill="#d4a574"/><rect x="24" y="10" width="24" height="10" rx="3" fill="#cc3300"/></svg>`,
  mai:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a0010"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#d4a882"/><rect x="21" y="30" width="30" height="20" rx="5" fill="#cc2244"/><rect x="17" y="30" width="9" height="15" rx="4" fill="#cc2244"/><rect x="46" y="30" width="9" height="15" rx="4" fill="#cc2244"/><circle cx="36" cy="13" r="5" fill="#d4a882"/><circle cx="52" cy="10" r="5" fill="#ff6688" opacity="0.6"/></svg>`,
  mbison:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a0022"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#c8c0d8"/><rect x="20" y="30" width="32" height="22" rx="5" fill="#220044"/><rect x="16" y="30" width="9" height="16" rx="4" fill="#220044"/><rect x="47" y="30" width="9" height="16" rx="4" fill="#220044"/><circle cx="36" cy="13" r="5" fill="#c8c0d8"/></svg>`,
  sagat:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#0a0800"/><ellipse cx="36" cy="19" rx="12" ry="12" fill="#8B5E3C"/><rect x="14" y="28" width="44" height="28" rx="5" fill="#cc4400" opacity="0.8"/><rect x="6" y="32" width="14" height="22" rx="5" fill="#cc4400" opacity="0.8"/><rect x="52" y="32" width="14" height="22" rx="5" fill="#cc4400" opacity="0.8"/><circle cx="36" cy="10" r="5" fill="#8B5E3C"/></svg>`,
  ingrid:`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="36" fill="#1a1400"/><ellipse cx="36" cy="21" rx="9" ry="10" fill="#d4a574"/><rect x="21" y="30" width="30" height="20" rx="5" fill="#D4A017"/><rect x="17" y="30" width="9" height="16" rx="4" fill="#D4A017"/><rect x="46" y="30" width="9" height="16" rx="4" fill="#D4A017"/><circle cx="36" cy="13" r="6" fill="#F5A623" opacity="0.7"/><circle cx="36" cy="13" r="3" fill="#F5A623"/></svg>`,
}

function SL({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
      <div style={{ width:10, height:2, background:'var(--sf-red)' }}/>
      <span style={{ fontFamily:'"Barlow Condensed"', fontSize:10, letterSpacing:3, color:'var(--sf-red)', textTransform:'uppercase' }}>{children}</span>
    </div>
  )
}
function ST({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily:'"Barlow Condensed"', fontSize:18, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:.3, marginBottom:10 }}>{children}</div>
}
export default function HomePage() {
  const [active, setActive] = useState<TabId>('newsletter')
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const askSensei = (prompt: string) => { setPendingPrompt(prompt); setActive('sensei') }
  return (
    <div style={{ minHeight:'100vh', background:'var(--sf-dark)' }}>
      <header style={{ background:'var(--sf-dark2)', borderBottom:'2px solid var(--sf-red)' }}>
        <div style={{ padding:'16px 20px 12px', position:'relative', overflow:'hidden' }}>
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} viewBox="0 0 1200 120" preserveAspectRatio="xMidYMid slice">
            <polygon points="900,0 1200,0 1200,120 1050,120" fill="#E81C2A" opacity="0.04"/>
            <line x1="0" y1="120" x2="1200" y2="72" stroke="#E81C2A" strokeWidth="0.8" opacity="0.08"/>
          </svg>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:16, height:2, background:'var(--sf-red)' }}/>
              <span style={{ fontFamily:'"Barlow Condensed"', fontSize:10, letterSpacing:4, color:'var(--sf-red)', textTransform:'uppercase' }}>AI Sensei · Complete SF6 Hub</span>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
              <div>
                <h1 style={{ fontFamily:'"Barlow Condensed"', fontWeight:900, fontSize:'clamp(32px,5vw,52px)', color:'#fff', textTransform:'uppercase', lineHeight:0.9, letterSpacing:-1, margin:0 }}>Street Fighter <span style={{ color:'var(--sf-red)' }}>6</span></h1>
                <p style={{ fontFamily:'"Barlow Condensed"', fontSize:11, color:'var(--sf-muted)', letterSpacing:'1.5px', textTransform:'uppercase', marginTop:4 }}>Newsletter · Roster · Meta · Events · AI Sensei · Results</p>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {[{l:'● Sensei Online',c:'var(--sf-green)',bg:'rgba(0,255,136,0.07)'},{l:'Issue #14 · May 2026',c:'var(--sf-red)',bg:'rgba(232,28,42,0.07)'},{l:'CPT 2026 · $2.1M',c:'var(--sf-gold)',bg:'rgba(245,166,35,0.07)'},{l:'EWC Jul 28 · $1M',c:'var(--sf-accent)',bg:'rgba(0,212,255,0.07)'}].map(p=>(
                  <span key={p.l} style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'3px 9px', borderRadius:2, border:`1px solid ${p.c}`, color:p.c, background:p.bg }}>{p.l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ background:'var(--sf-dark3)', borderTop:'1px solid var(--sf-border)', padding:'7px 20px', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontFamily:'"Barlow Condensed"', fontSize:9, letterSpacing:3, color:'var(--sf-muted)', textTransform:'uppercase', flexShrink:0 }}>Drive Gauge</span>
          <div style={{ flex:1, height:4, background:'var(--sf-border)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:'74%', background:'var(--sf-accent)', borderRadius:2 }} className="animate-gauge"/>
          </div>
          <div style={{ display:'flex', gap:3 }}>
            {[1,2,3,4,5,6].map(i=><div key={i} style={{ width:22, height:3, borderRadius:1, background:i<=4?'var(--sf-accent)':'var(--sf-border)', opacity:i<=4?0.7:1 }}/>)}
          </div>
        </div>
      </header>
      <nav style={{ display:'flex', background:'var(--sf-dark2)', overflowX:'auto', padding:'0 8px', borderBottom:'1px solid var(--sf-border)', position:'sticky', top:0, zIndex:50 }}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setActive(tab.id as TabId)} style={{ padding:'10px 12px', fontFamily:'"Barlow Condensed"', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:active===tab.id?'var(--sf-red)':'var(--sf-muted)', background:'none', border:'none', borderBottom:`2px solid ${active===tab.id?'var(--sf-red)':'transparent'}`, cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5, transition:'all 0.15s' }}>
            <i className={`ti ${tab.icon}`} style={{ fontSize:13 }}/>{tab.label}
          </button>
        ))}
      </nav>
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'20px 16px' }}>
        {active==='newsletter' && <NewsletterTab />}
        {active==='roster'     && <RosterTab />}
        {active==='sensei'     && <SenseiTab pendingPrompt={pendingPrompt} onConsumePrompt={()=>setPendingPrompt(null)} />}
        {active==='climb'      && <TheClimb />}
        {active==='punish'     && <PunishFinder onAskSensei={askSensei} />}
        {active==='challenger' && <CharacterDossier onAskSensei={askSensei} />}
        {active==='rivals'     && <RivalRadar onAskSensei={askSensei} />}
        {active==='lab'        && <LabPlaylist onAskSensei={askSensei} />}
        {active==='flashcards' && <FrameFlashcards />}
        {active==='debrief'    && <VoiceDebrief />}
        {active==='ghost'      && <GhostRival onAskSensei={askSensei} />}
        {active==='tierlist'   && <CommunityTierList />}
        {active==='meta'       && <MetaTab />}
        {active==='predictor'  && <PredictorTab />}
        {active==='quiz'       && <QuizTab />}
        {active==='events'     && <EventsTab />}
        {active==='players'    && <PlayersTab />}
        {active==='results'    && <ResultsTab />}
      </main>
    </div>
  )
}

function NewsletterTab() {
  const articles = [
    { cat:'Event Preview', cc:'var(--sf-red)', title:'Combo Breaker 2026: A Wide-Open Throne', sub:'May 22–24 · Schaumburg, IL · $19,710 SF6 pool · 2 EWC spots', body:'With Sahara freshly crowned as CC12 champion and Season 3 still finding its shape, Combo Breaker 2026 is the most wide-open premier of the year. Nobody walks in as a clear favourite.', hl:'What\'s at stake: $19,710 SF6 prize money · 2 direct EWC spots · CPT points for CC13 · First real test of Alex in a premier bracket', date:'May 22–24' },
    { cat:'Hot Take', cc:'#ff6666', title:"Capcom's $2,000 Premier: The FGC Is Right to Be Angry", sub:'CPT 2026 prize structure has players furious — the numbers back them up', body:"CPT 2026 runs a $2.1M total prize pool. Then you see Capcom's contribution to Premiers like Combo Breaker: $2,000 to the winner. EVO 2026 gets zero Capcom prize money.", hl:'Reality: $19,710 pool at Combo Breaker — mostly TO-funded · Capcom adds $2,000 · EVO 2026: $0 from Capcom · $1M+ locked in CC13 Japan 2027', date:'🔥 Hot topic' },
    { cat:'Season Preview', cc:'var(--sf-gold)', title:'EVO Las Vegas 2026: Where Legacies Are Made', sub:'June 26–28 · Las Vegas · The world\'s biggest FG event', body:'One month after Combo Breaker, the entire FGC hits Las Vegas. EVO 2024 drew 10,240 SF6 entrants — the record. Punk won 2024. MenaRD took 2025. Who becomes EVO 2026 champion?', hl:'EVO 2026: Most prestigious SF6 title outside CC · 2 EWC qualification spots · DLC announcement rumoured from Capcom', date:'Jun 26–28' },
    { cat:'Meta Report', cc:'var(--sf-accent)', title:"Season 3: EndingWalker's 10-0, Tokido Goes JP", sub:'The defining storylines of the early Season 3 metagame', body:"Season 3 is six weeks in. Alex sits at B-tier with high upside. The headline is EndingWalker going 10-0 in the SFL with Ryu. After Elena update buffs he's proving the character is elite.", hl:'Top storylines: EndingWalker 10-0 Ryu — MOUZ top seed · Tokido switches to JP for Season 3 · Kawano on Akuma at CC12 · Multiple Ryu in CC12 top 8', date:'Meta update' },
    { cat:'FGC Legends', cc:'var(--sf-purple)', title:'Justin Wong & Daigo: The GOATs Are Still Competing', sub:'Two of the greatest ever — still showing up in Season 3', body:"Justin Wong has been competing since SF2 and is still posting results. Daigo Umehara — The Beast — qualified for EWC 2026 via the SFL World Championship at age 42. Longevity is the ultimate flex.", hl:'Daigo qualified for EWC 2026 Riyadh $1M event via SFL WC · Justin Wong still competing after 30+ years · Combined 40+ years of top-level FGC experience', date:'Legends feature' },
    { cat:'Community Corner', cc:'var(--sf-green)', title:'From Casual to Competitor: Your FGC Roadmap', sub:'How to go from SF6 online ranked to standing on stage', body:'The FGC is one of the most welcoming competitive communities in gaming. The jump from online to offline is real — but nothing accelerates improvement faster.', hl:'Entry points: Find locals at start.gg · SF6 subreddit & Discord · CPT World Warrior qualifiers — open to everyone · Follow EventHubs & Liquipedia', date:'Community' },
    { cat:'Character Reveal', cc:'var(--sf-gold)', title:'Ingrid Joins the Roster: The Eternal Goddess Returns', sub:'Season 3\'s newest drop brings sun-powered mix-ups to SF6', body:'The classic Sun Goddess arrives with a Sun Shot zoning tool, mobility specials that threaten side-switches, and an install state built for extended pressure. Early days — the community is still mapping her frame data.', hl:'New Challenger tab has her full day-one dossier · Dossier flagged unverified until in-game confirmation · First Ingrid specialists expected at Combo Breaker', date:'New Challenger' },
  ]
  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#0f0a1a,#1a0a0f)', border:'1px solid var(--sf-border)', borderRadius:4, padding:20, marginBottom:14 }}>
        <div style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'var(--sf-muted)', marginBottom:6 }}>The Dojo Dispatch · Issue #14 · May 25, 2026</div>
        <div style={{ fontFamily:'"Barlow Condensed"', fontWeight:900, fontSize:'clamp(22px,4vw,34px)', color:'#fff', lineHeight:1.1, textTransform:'uppercase', letterSpacing:-0.5, marginBottom:8 }}>Combo Breaker is <span style={{ color:'var(--sf-red)' }}>Days Away</span></div>
        <div style={{ fontSize:13, color:'#aaaacc', lineHeight:1.6, marginBottom:12, maxWidth:600 }}>Chicago this weekend. $19,710 on the line. Two EWC spots up for grabs. Plus the prize pool controversy, EVO hype, EndingWalker&apos;s 10-0, and the legends are still showing up.</div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, background:'var(--sf-red)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Barlow Condensed"', fontSize:14, fontWeight:900, color:'#fff', flexShrink:0 }}>D</div>
          <div><div style={{ fontFamily:'"Barlow Condensed"', fontSize:11, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:.5 }}>Dojo Dispatch</div><div style={{ fontSize:10, color:'var(--sf-muted)', marginTop:1 }}>AI Sensei editorial · May 25, 2026</div></div>
          <span style={{ marginLeft:'auto', fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', padding:'2px 8px', borderRadius:2, border:'1px solid var(--sf-red)', color:'var(--sf-red)', background:'rgba(232,28,42,0.07)' }}>● Weekly</span>
        </div>
      </div>
      {articles.map((a,i)=>(
        <div key={i} style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, marginBottom:10, overflow:'hidden' }}>
          <div style={{ padding:'12px 14px 10px', borderBottom:'1px solid var(--sf-border)' }}>
            <div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:a.cc, marginBottom:4 }}>{a.cat}</div>
            <div style={{ fontFamily:'"Barlow Condensed"', fontWeight:900, fontSize:'clamp(14px,2.5vw,19px)', color:'#fff', textTransform:'uppercase', lineHeight:1.1, marginBottom:3 }}>{a.title}</div>
            <div style={{ fontSize:11, color:'var(--sf-muted)' }}>{a.sub}</div>
          </div>
          <div style={{ padding:'12px 14px', fontSize:13, color:'#aaaacc', lineHeight:1.72 }}>
            <p style={{ marginBottom:10 }}>{a.body}</p>
            <div style={{ background:'rgba(232,28,42,0.07)', borderLeft:'2px solid var(--sf-red)', padding:'9px 12px', borderRadius:'0 3px 3px 0', fontSize:12, color:'var(--sf-text)', lineHeight:1.6 }}>{a.hl}</div>
          </div>
          <div style={{ padding:'9px 14px', borderTop:'1px solid var(--sf-border)' }}>
            <span style={{ fontFamily:'"Barlow Condensed"', fontSize:9, color:'var(--sf-muted)', textTransform:'uppercase', letterSpacing:.5 }}>{a.date}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function RosterTab() {
  const [sel, setSel] = useState<string|null>(null)
  const fighter = FIGHTERS.find(f=>f.id===sel)
  return (
    <div>
      <SL>Season 3 · 27 Characters · Tap to view</SL><ST>Roster</ST>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(95px,1fr))', gap:6, marginBottom:14 }}>
        {FIGHTERS.map(f=>(
          <div key={f.id} onClick={()=>setSel(sel===f.id?null:f.id)} style={{ background:'var(--sf-dark2)', border:`1px solid ${sel===f.id?'var(--sf-red)':'var(--sf-border)'}`, borderRadius:4, cursor:'pointer', overflow:'hidden', position:'relative', transition:'border-color 0.15s' }}>
            <div style={{ width:'100%', aspectRatio:'1', overflow:'hidden', background:'#1a1a2e' }}>
              <img src={`/characters/${f.id}.jpg`} alt={f.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} onError={(e)=>{ const t=e.target as HTMLImageElement; t.style.display='none'; t.parentElement!.innerHTML=AVT[f.id]||''; }}/>
            </div>
            <span style={{ position:'absolute', top:4, right:4, fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, padding:'1px 4px', borderRadius:2 }} className={`tier-${f.tier.toLowerCase()}`}>{(f as any).isNew?'NEW':f.tier}</span>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent,rgba(0,0,0,0.9))', padding:'5px 5px 4px' }}>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:.3 }}>{f.name}</div>
              <div style={{ fontSize:8, color:'var(--sf-muted)', textTransform:'uppercase' }}>{f.type}</div>
            </div>
          </div>
        ))}
      </div>
      {fighter && (
        <div style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, overflow:'hidden', marginBottom:12 }}>
          <div style={{ background:'var(--sf-dark3)', borderBottom:'1px solid var(--sf-border)', padding:'12px 14px', display:'flex', alignItems:'flex-start', gap:12 }}>
            <div style={{ width:64, height:64, borderRadius:4, overflow:'hidden', flexShrink:0, border:`2px solid ${fighter.color}`, background:'#1a1a2e' }}>
              <img src={`/characters/${fighter.id}.jpg`} alt={fighter.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} onError={(e)=>{ const t=e.target as HTMLImageElement; t.style.display='none'; t.parentElement!.innerHTML=AVT[fighter.id]||''; }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:20, fontWeight:900, color:'#fff', textTransform:'uppercase', lineHeight:1 }}>{fighter.name}</div>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:11, color:'var(--sf-muted)', textTransform:'uppercase', letterSpacing:.5, margin:'2px 0' }}>{fighter.type}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginTop:4 }}>{fighter.tags.map(t=><span key={t} style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, textTransform:'uppercase', padding:'1px 6px', border:'1px solid var(--sf-border)', borderRadius:2, color:'var(--sf-muted)' }}>{t}</span>)}</div>
            </div>
            <span style={{ fontFamily:'"Barlow Condensed"', fontSize:13, fontWeight:700, padding:'3px 9px', borderRadius:2, flexShrink:0 }} className={`tier-${fighter.tier.toLowerCase()}`}>{fighter.tier}</span>
          </div>
          <div style={{ padding:'12px 14px' }}>
            <p style={{ fontSize:12, color:'#aaaacc', lineHeight:1.65, marginBottom:10 }}>{fighter.profile}</p>
            {/* Difficulty + Combo */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
              <div style={{ background:'var(--sf-dark3)', borderRadius:3, padding:'8px 10px' }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-muted)', marginBottom:3 }}>Difficulty</div>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:13, fontWeight:700, color:(fighter as any).difficulty==='Beginner'?'var(--sf-green)':(fighter as any).difficulty==='Expert'?'var(--sf-red)':'var(--sf-gold)' }}>{(fighter as any).difficulty||'Intermediate'}</div>
              </div>
              <div style={{ background:'var(--sf-dark3)', borderRadius:3, padding:'8px 10px' }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-muted)', marginBottom:3 }}>Combo Starter</div>
                <div style={{ fontSize:9, color:'var(--sf-accent)', fontFamily:'monospace', lineHeight:1.4 }}>{(fighter as any).combo||'—'}</div>
              </div>
            </div>
            {/* Lore */}
            {(fighter as any).lore && <div style={{ marginBottom:10 }}><div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-gold)', marginBottom:4 }}>Character Lore</div><p style={{ fontSize:11, color:'#9999bb', lineHeight:1.6, margin:0 }}>{(fighter as any).lore}</p></div>}
            {/* S3 Changes */}
            {(fighter as any).s3 && <div style={{ background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.15)', borderRadius:3, padding:'8px 10px', marginBottom:10 }}><div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-accent)', marginBottom:4 }}>Season 3 Changes</div><p style={{ fontSize:11, color:'#aaaacc', lineHeight:1.55, margin:0 }}>{(fighter as any).s3}</p></div>}
            {/* Top Players */}
            {(fighter as any).topPlayers && <div style={{ marginBottom:10, padding:'7px 10px', background:'rgba(245,166,35,0.05)', border:'1px solid rgba(245,166,35,0.15)', borderRadius:3 }}><div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-gold)', marginBottom:3 }}>Top Players</div><div style={{ fontSize:11, color:'#aaaacc' }}>{(fighter as any).topPlayers}</div></div>}
            {/* Stats */}
            {Object.entries(fighter.stats).map(([k,v])=>(
              <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', color:'var(--sf-muted)', width:66, flexShrink:0 }}>{k}</div>
                <div style={{ flex:1, height:4, background:'var(--sf-border)', borderRadius:2, overflow:'hidden' }}><div style={{ height:'100%', width:`${v}%`, background:SC[k], borderRadius:2, transition:'width 0.5s ease' }}/></div>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:11, fontWeight:700, color:'var(--sf-text)', width:22, textAlign:'right' }}>{v}</div>
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
              <div style={{ background:'var(--sf-dark3)', borderRadius:3, padding:'10px 12px' }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-green)', marginBottom:5 }}>Strengths</div>
                {fighter.strengths.map(s=><div key={s} style={{ fontSize:11, color:'var(--sf-muted)', padding:'2px 0', borderBottom:'1px solid var(--sf-border)' }}>✓ {s}</div>)}
              </div>
              <div style={{ background:'var(--sf-dark3)', borderRadius:3, padding:'10px 12px' }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-red)', marginBottom:5 }}>Weaknesses</div>
                {fighter.weaknesses.map(s=><div key={s} style={{ fontSize:11, color:'var(--sf-muted)', padding:'2px 0', borderBottom:'1px solid var(--sf-border)' }}>✗ {s}</div>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SenseiTab({ pendingPrompt, onConsumePrompt }: { pendingPrompt?: string | null; onConsumePrompt?: () => void }) {
  const FREE_LIMIT = 5
  const [msgs, setMsgs] = useState([{ role:'assistant', content:'I am your AI Sensei. Ask me anything about SF6 — strategy, players, events, results, patch notes, meta or frame data.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [usedToday, setUsedToday] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }) },[msgs])
  useEffect(()=>{
    initBilling()
    checkProStatus().then(p => { if (p) setIsPro(true) })
    try {
      const today = new Date().toISOString().slice(0,10)
      const saved = JSON.parse(localStorage.getItem('senseiUsage') || '{}')
      if (saved.date === today) setUsedToday(saved.count || 0)
      else { localStorage.setItem('senseiUsage', JSON.stringify({ date:today, count:0 })); setUsedToday(0) }
    } catch {}
  },[])
  useEffect(()=>{
    if (pendingPrompt) { send(pendingPrompt); onConsumePrompt?.() }
  },[pendingPrompt])
  const bumpUsage = () => {
    try {
      const today = new Date().toISOString().slice(0,10)
      const saved = JSON.parse(localStorage.getItem('senseiUsage') || '{}')
      const count = (saved.date === today ? (saved.count || 0) : 0) + 1
      localStorage.setItem('senseiUsage', JSON.stringify({ date:today, count }))
      setUsedToday(count)
    } catch {}
  }
  const unlockPro = async () => {
    setPurchasing(true)
    try {
      const active = await buyPro()
      if (active) {
        setIsPro(true); setShowPaywall(false)
        setMsgs(prev=>[...prev, { role:'assistant', content:'🥋 Dojo Pro unlocked — unlimited Sensei. Let\'s get to work.' }])
        toast.success('Dojo Pro unlocked!')
      } else {
        toast('Purchase cancelled')
      }
    } catch {
      toast.error('Purchase unavailable — try again from the Dojo Dispatch Android app.')
    }
    setPurchasing(false)
  }
  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    if (!isPro && usedToday >= FREE_LIMIT) { setShowPaywall(true); return }
    setInput('')
    const newMsgs = [...msgs, { role:'user', content:msg }]
    setMsgs(newMsgs)
    setLoading(true)
    try {
      const res = await fetch('/api/sensei', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ messages:newMsgs.map(m=>({ role:m.role, content:m.content })) }) })
      const data = await res.json()
      setMsgs(prev=>[...prev, { role:'assistant', content:data.content || 'Sensei unavailable — please retry.' }])
      if (!isPro) bumpUsage()
    } catch {
      setMsgs(prev=>[...prev, { role:'assistant', content:'Sensei unavailable — please retry.' }])
    }
    setLoading(false)
  }
  const quick = ['Combo Breaker 2026 preview','EndingWalker 10-0 Ryu','Daigo EWC 2026 qualification','Justin Wong career story','Best Season 3 rank pick','JP April 2026 patch','Punk vs MenaRD who wins EVO','How to escape burnout']
  const remaining = Math.max(0, FREE_LIMIT - usedToday)
  return (
    <div>
      <div style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, padding:14, marginBottom:12, display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ width:48, height:48, background:'var(--sf-dark3)', border:'1px solid var(--sf-border)', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative' }}>
          <i className="ti ti-torii" style={{ fontSize:22, color:'var(--sf-red)' }}/>
          <div style={{ position:'absolute', top:-3, right:-3, width:9, height:9, borderRadius:'50%', background:'var(--sf-green)', border:'2px solid var(--sf-dark2)' }} className="animate-blink"/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'"Barlow Condensed"', fontSize:18, fontWeight:900, color:'#fff', textTransform:'uppercase', lineHeight:1 }}>AI Sensei</div>
          <div style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:600, letterSpacing:2, textTransform:'uppercase', color:'var(--sf-red)', marginTop:2 }}>Master Strategist · Live Web Search</div>
          <div style={{ fontSize:11, color:'var(--sf-muted)', marginTop:4, lineHeight:1.5 }}>Searches live patch notes, tier lists, tournament results and frame data in real time.</div>
        </div>
        <div style={{ flexShrink:0, textAlign:'right' }}>
          {isPro ? (
            <span style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'3px 8px', borderRadius:2, background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.3)', color:'var(--sf-gold)' }}>★ Dojo Pro</span>
          ) : (
            <span style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', padding:'3px 8px', borderRadius:2, background:'var(--sf-dark3)', border:'1px solid var(--sf-border)', color:'var(--sf-muted)' }}>{remaining}/{FREE_LIMIT} free today</span>
          )}
        </div>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:9 }}>
        {quick.map(q=><button key={q} onClick={()=>send(q)} style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', padding:'3px 8px', border:'1px solid var(--sf-border)', borderRadius:2, background:'transparent', color:'var(--sf-muted)', cursor:'pointer' }}>{q}</button>)}
      </div>
      {showPaywall && (
        <div style={{ background:'rgba(245,166,35,0.05)', border:'1px solid rgba(245,166,35,0.25)', borderRadius:4, padding:16, marginBottom:12, textAlign:'center' }}>
          <div style={{ fontFamily:'"Barlow Condensed"', fontSize:16, fontWeight:900, color:'var(--sf-gold)', textTransform:'uppercase', letterSpacing:1 }}>★ Daily Free Limit Reached</div>
          <div style={{ fontSize:12, color:'var(--sf-muted)', margin:'6px 0 12px', lineHeight:1.5 }}>You&apos;ve used your {FREE_LIMIT} free Sensei questions today. Unlock <strong style={{ color:'#fff' }}>Dojo Pro</strong> for unlimited access — one-time $4.99.</div>
          <button onClick={unlockPro} disabled={purchasing} style={{ padding:'9px 22px', background:'var(--sf-gold)', color:'#1a1a1a', border:'none', borderRadius:3, fontFamily:'"Barlow Condensed"', fontSize:14, fontWeight:900, letterSpacing:1, textTransform:'uppercase', cursor:purchasing?'default':'pointer', opacity:purchasing?0.6:1 }}>{purchasing ? 'Processing…' : 'Unlock Dojo Pro · $4.99'}</button>
        </div>
      )}
      <div style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ background:'var(--sf-dark3)', borderBottom:'1px solid var(--sf-border)', padding:'8px 12px', display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--sf-green)' }} className="animate-blink"/>
          <span style={{ fontFamily:'"Barlow Condensed"', fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'#fff', flex:1 }}>AI Sensei</span>
          <span style={{ fontFamily:'"Barlow Condensed"', fontSize:9, color:'var(--sf-muted)' }}>Live search · Season 3</span>
        </div>
        <div style={{ padding:12, minHeight:160, maxHeight:400, overflowY:'auto', display:'flex', flexDirection:'column', gap:7 }}>
          {msgs.map((m,i)=><div key={i} style={{ padding:'8px 11px', borderRadius:3, fontSize:12, lineHeight:1.55, maxWidth:'90%', background:m.role==='user'?'rgba(232,28,42,0.1)':'var(--sf-dark3)', border:m.role==='user'?'1px solid rgba(232,28,42,0.2)':'1px solid var(--sf-border)', alignSelf:m.role==='user'?'flex-end':'flex-start', color:'var(--sf-text)' }}>{m.content}</div>)}
          {loading && <div style={{ padding:'8px 11px', borderRadius:3, fontSize:12, background:'var(--sf-dark3)', border:'1px solid var(--sf-border)', alignSelf:'flex-start', color:'var(--sf-muted)', display:'flex', alignItems:'center', gap:6 }}><div style={{ width:10, height:10, border:'2px solid rgba(255,255,255,0.2)', borderTopColor:'#fff', borderRadius:'50%' }} className="animate-spin-sm"/>Sensei searching...</div>}
          <div ref={bottomRef}/>
        </div>
        <div style={{ borderTop:'1px solid var(--sf-border)', display:'flex' }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about events, players, strategy, frame data..." style={{ flex:1, padding:'10px 13px', background:'transparent', border:'none', fontSize:12, color:'var(--sf-text)', fontFamily:'Barlow, sans-serif', outline:'none' }}/>
          <button onClick={()=>send()} style={{ padding:'10px 14px', background:'var(--sf-red)', border:'none', color:'#fff', cursor:'pointer', fontSize:13 }}><i className="ti ti-send"/></button>
        </div>
      </div>
    </div>
  )
}

function MetaTab() {
  const tiers = [
    { label:'S', color:'var(--sf-gold)', bg:'rgba(245,166,35,0.1)', border:'rgba(245,166,35,0.22)', chars:['Luke','Akuma','Ken','Juri','Chun-Li'] },
    { label:'A', color:'#bbb', bg:'rgba(170,170,170,0.06)', border:'rgba(170,170,170,0.16)', chars:['Ryu','Cammy','Ed','Rashid','Guile','Kimberly','Terry','Mai'] },
    { label:'B', color:'#6699cc', bg:'rgba(102,153,204,0.06)', border:'rgba(102,153,204,0.16)', chars:['Manon','Marisa','Zangief','Blanka','E. Honda','Sagat','M. Bison','Alex ★'] },
    { label:'C', color:'#556677', bg:'rgba(85,102,119,0.06)', border:'rgba(85,102,119,0.16)', chars:['JP','Dhalsim','Jamie','Dee Jay','AKI','Lily'] },
  ]
  const patches = [
    { dot:'var(--sf-red)',    date:'Apr 15',  char:'JP',            move:'Departure: Shadow — startup fix',    desc:'Unintended 1-frame faster startup when canceled from st.MP, st.HK, cr.LK or cr.MK. Fixed.', badge:'pfix', label:'Bug fix' },
    { dot:'var(--sf-red)',    date:'Apr 15',  char:'M. Bison',      move:'Psycho Mine — Drive Reversal bug',   desc:'Mine stayed embedded if Drive Reversal performed after blocking. Fixed.', badge:'pfix', label:'Bug fix' },
    { dot:'var(--sf-green)',  date:'Mar 17',  char:'Alex ★ Year 3', move:'New character added',                desc:'Grappler/rush-down hybrid. Power Bomb, Slash Elbow. B-tier with high upside.', badge:'pbuff', label:'New' },
    { dot:'var(--sf-accent)', date:'Mar 17',  char:'Drive Impact',  move:'Proximity block — frame 3 → 17',    desc:'Activation box moved from frame 3 to frame 17. Defenders get cleaner window.', badge:'psys', label:'System' },
    { dot:'var(--sf-green)',  date:"Jun '25", char:'Ryu',           move:'Denjin Hadoken — 5 hits → 8 hits',  desc:'Projectile speed doubled, hits increased from 5 to 8. Strongest Ryu zoning ever.', badge:'pbuff', label:'Buff' },
  ]
  const bc: Record<string,{bg:string,color:string}> = {
    pbuff:{bg:'rgba(0,255,136,0.1)',color:'var(--sf-green)'},
    pfix:{bg:'rgba(153,153,204,0.1)',color:'#9999cc'},
    psys:{bg:'rgba(0,212,255,0.08)',color:'var(--sf-accent)'},
  }
  return (
    <div>
      <div style={{ background:'rgba(0,255,136,0.04)', border:'1px solid rgba(0,255,136,0.12)', borderRadius:3, padding:'7px 11px', marginBottom:12, display:'flex', alignItems:'center', gap:8, fontSize:11, color:'var(--sf-green)' }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--sf-green)', flexShrink:0 }} className="animate-blink"/>
        <strong>Live meta feed</strong> · Season 3 · Alex Mar 17 · Latest patch Apr 15, 2026
      </div>
      <SL>Season 3 · Year 3 · 27 fighters</SL><ST>Current Tier List</ST>
      <div style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, overflow:'hidden', marginBottom:16 }}>
        {tiers.map(tier=>(
          <div key={tier.label} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 13px', borderBottom:'1px solid var(--sf-border)' }}>
            <span style={{ fontFamily:'"Barlow Condensed"', fontSize:17, fontWeight:900, width:22, textAlign:'center', color:tier.color, flexShrink:0 }}>{tier.label}</span>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, flex:1 }}>
              {tier.chars.map(c=><span key={c} style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, letterSpacing:.3, textTransform:'uppercase', padding:'2px 7px', borderRadius:2, background:tier.bg, border:`1px solid ${tier.border}`, color:tier.color }}>{c}</span>)}
            </div>
          </div>
        ))}
      </div>
      <SL>April 15 · March 17, 2026</SL><ST>Patch Feed</ST>
      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:14 }}>
        {patches.map((p,i)=>(
          <div key={i} style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, padding:'10px 12px', display:'flex', gap:10 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, flexShrink:0, width:36 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:p.dot }}/>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:600, color:'var(--sf-muted)', textAlign:'center', lineHeight:1.2 }}>{p.date}</div>
            </div>
            <div>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:13, fontWeight:900, color:'#fff', textTransform:'uppercase', lineHeight:1 }}>{p.char}</div>
              <div style={{ fontSize:10, color:'var(--sf-muted)', margin:'1px 0', fontFamily:'"Barlow Condensed"', fontWeight:600, textTransform:'uppercase' }}>{p.move}</div>
              <div style={{ fontSize:11, color:'#8888aa', lineHeight:1.5, marginTop:3 }}>{p.desc}</div>
              <span style={{ display:'inline-block', fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, padding:'1px 5px', borderRadius:2, marginTop:3, background:bc[p.badge]?.bg, color:bc[p.badge]?.color }}>{p.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PredictorTab() {
  const [p1,setP1]=useState(''); const [p2,setP2]=useState('')
  const [result,setResult]=useState<null|{p1p:number;p2p:number;f1:typeof FIGHTERS[0];f2:typeof FIGHTERS[0]}>(null)
  const predict=()=>{
    if(!p1||!p2||p1===p2)return
    const f1=FIGHTERS.find(f=>f.id===p1)!; const f2=FIGHTERS.find(f=>f.id===p2)!
    const [p1p,p2p]=MU[p1]?.[p2]||[50,50]
    setResult({p1p,p2p,f1,f2})
  }
  const ss={ width:'100%', padding:'9px 10px', background:'var(--sf-dark2)' as const, border:'1px solid var(--sf-border)', borderRadius:3, fontFamily:'"Barlow Condensed"' as const, fontSize:13, fontWeight:700, color:'var(--sf-text)' as const, textTransform:'uppercase' as const }
  return (
    <div>
      <SL>AI Analysis</SL><ST>Match Predictor</ST>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 40px 1fr', gap:9, alignItems:'center', marginBottom:10 }}>
        <select style={ss} value={p1} onChange={e=>setP1(e.target.value)}><option value="">— Fighter 1 —</option>{FIGHTERS.map(f=><option key={f.id} value={f.id}>{f.name.toUpperCase()}</option>)}</select>
        <div style={{ fontFamily:'"Barlow Condensed"', fontSize:18, fontWeight:900, color:'var(--sf-red)', textAlign:'center' }}>VS</div>
        <select style={ss} value={p2} onChange={e=>setP2(e.target.value)}><option value="">— Fighter 2 —</option>{FIGHTERS.map(f=><option key={f.id} value={f.id}>{f.name.toUpperCase()}</option>)}</select>
      </div>
      <button onClick={predict} style={{ width:'100%', padding:11, background:'var(--sf-red)', color:'#fff', border:'none', borderRadius:3, fontFamily:'"Barlow Condensed"', fontSize:15, fontWeight:900, letterSpacing:3, textTransform:'uppercase', cursor:'pointer', marginBottom:14 }}>Fight!</button>
      {result && (
        <div style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, padding:14 }}>
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:20, marginBottom:14 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:4, overflow:'hidden', border:`2px solid ${result.f1.color}`, margin:'0 auto 5px', background:'#1a1a2e' }}>
                <img src={`/characters/${result.f1.id}.jpg`} alt={result.f1.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
              </div>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:12, fontWeight:700, color:'#fff', textTransform:'uppercase' }}>{result.f1.name}</div>
            </div>
            <div style={{ fontFamily:'"Barlow Condensed"', fontSize:20, fontWeight:900, color:'var(--sf-red)' }}>VS</div>
            <div style={{ textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:4, overflow:'hidden', border:`2px solid ${result.f2.color}`, margin:'0 auto 5px', background:'#1a1a2e' }}>
                <img src={`/characters/${result.f2.id}.jpg`} alt={result.f2.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
              </div>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:12, fontWeight:700, color:'#fff', textTransform:'uppercase' }}>{result.f2.name}</div>
            </div>
          </div>
          <div style={{ height:32, borderRadius:3, overflow:'hidden', display:'flex', marginBottom:6, border:'1px solid var(--sf-border)' }}>
            <div style={{ width:`${result.p1p}%`, background:'var(--sf-red)', display:'flex', alignItems:'center', padding:'0 9px', fontFamily:'"Barlow Condensed"', fontSize:13, fontWeight:700, color:'#fff' }}>{result.p1p}%</div>
            <div style={{ flex:1, background:'#185FA5', display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 9px', fontFamily:'"Barlow Condensed"', fontSize:13, fontWeight:700, color:'#fff' }}>{result.p2p}%</div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'"Barlow Condensed"', fontSize:9, color:'var(--sf-muted)', textTransform:'uppercase', marginBottom:10 }}><span>{result.f1.name}</span><span>{result.f2.name}</span></div>
          {result.p1p!==result.p2p && <div style={{ padding:'7px 10px', background:'rgba(245,166,35,0.06)', border:'1px solid rgba(245,166,35,0.16)', borderRadius:3, fontFamily:'"Barlow Condensed"', fontSize:11, fontWeight:700, color:'var(--sf-gold)', textTransform:'uppercase', marginBottom:10 }}>🏆 {result.p1p>result.p2p?result.f1.name:result.f2.name} advantage · {Math.abs(result.p1p-result.p2p)<5?'Very close':Math.abs(result.p1p-result.p2p)<12?'Clear edge':'Strong'}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
            {[['Pace',(result.f1.stats.speed+result.f2.stats.speed)/2>80?'Fast':'Moderate'],['Drive use',(result.f1.stats.drive+result.f2.stats.drive)/2>84?'Heavy':'Balanced'],['Key zone',(result.f1.stats.range+result.f2.stats.range)/2>78?'Mid-range':'Close range'],['Upset risk',Math.abs(result.p1p-result.p2p)<5?'Very high':'Moderate']].map(([l,v])=>(
              <div key={l} style={{ background:'var(--sf-dark3)', border:'1px solid var(--sf-border)', borderRadius:3, padding:'7px 9px' }}><div style={{ fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-muted)', marginBottom:1 }}>{l}</div><div style={{ fontFamily:'"Barlow Condensed"', fontSize:13, fontWeight:700, color:'#fff' }}>{v}</div></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function QuizTab() {
  const [idx,setIdx]=useState(0); const [score,setScore]=useState(0)
  const [answered,setAnswered]=useState(false); const [chosen,setChosen]=useState<number|null>(null)
  const total=QUIZ_DATA.length
  const answer=(i:number)=>{ if(answered)return; setAnswered(true); setChosen(i); if(i===QUIZ_DATA[idx].ans)setScore(s=>s+1) }
  const next=()=>{ setIdx(i=>i+1); setAnswered(false); setChosen(null) }
  const reset=()=>{ setIdx(0); setScore(0); setAnswered(false); setChosen(null) }
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, padding:'10px 13px', marginBottom:11, gap:10 }}>
        <div><div style={{ fontFamily:'"Barlow Condensed"', fontSize:26, fontWeight:900, color:'var(--sf-red)' }}>{score}/{Math.min(idx+(answered?1:0),total)}</div><div style={{ fontSize:9, color:'var(--sf-muted)', textTransform:'uppercase', letterSpacing:.5 }}>Today&apos;s score</div></div>
        <div style={{ flex:1, height:3, background:'var(--sf-border)', borderRadius:2, overflow:'hidden' }}><div style={{ height:'100%', background:'var(--sf-red)', borderRadius:2, width:`${Math.round((score/total)*100)}%`, transition:'width 0.3s' }}/></div>
        <div style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', color:'var(--sf-muted)' }}>{idx<total?`Q ${idx+1} of ${total}`:'Done'}</div>
      </div>
      {idx>=total?(
        <div style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, padding:24, textAlign:'center' }}>
          <div style={{ fontFamily:'"Barlow Condensed"', fontSize:44, fontWeight:900, color:'var(--sf-red)' }}>{score}/{total}</div>
          <div style={{ fontFamily:'"Barlow Condensed"', fontSize:13, color:'var(--sf-muted)', textTransform:'uppercase', letterSpacing:.5, margin:'7px 0' }}>{score===total?'Perfect — True SF6 Scholar!':score>=6?'Strong — keep grinding!':score>=4?'Good start — study the meta.':'Back to the dojo.'}</div>
          <button onClick={reset} style={{ marginTop:12, padding:'9px 22px', background:'var(--sf-red)', color:'#fff', border:'none', borderRadius:3, fontFamily:'"Barlow Condensed"', fontSize:13, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', cursor:'pointer' }}>Retry</button>
        </div>
      ):(
        <div style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, padding:14 }}>
          <div style={{ fontFamily:'"Barlow Condensed"', fontSize:16, fontWeight:600, color:'#fff', lineHeight:1.4, marginBottom:12 }}>{QUIZ_DATA[idx].q}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {QUIZ_DATA[idx].opts.map((o,i)=>{
              let bg='var(--sf-dark3)',bdr='var(--sf-border)',clr='var(--sf-muted)'
              if(answered){
                if(i===QUIZ_DATA[idx].ans){bg='rgba(0,255,136,0.05)';bdr='var(--sf-green)';clr='var(--sf-green)'}
                else if(i===chosen){bg='rgba(232,28,42,0.05)';bdr='var(--sf-red)';clr='#ff6666'}
              }
              return <button key={i} onClick={()=>answer(i)} disabled={answered} style={{ padding:'8px 12px', background:bg, border:`1px solid ${bdr}`, borderRadius:3, fontSize:12, color:clr, cursor:answered?'default':'pointer', textAlign:'left', fontFamily:'Barlow, sans-serif', display:'flex', alignItems:'center', gap:7 }}><span style={{ fontFamily:'"Barlow Condensed"', fontWeight:700, fontSize:12, color:'var(--sf-red)', flexShrink:0 }}>{String.fromCharCode(65+i)}</span>{o}</button>
            })}
          </div>
          {answered&&<>
            <div style={{ fontSize:11, color:'var(--sf-muted)', marginTop:9, padding:'9px 11px', background:'var(--sf-dark3)', borderRadius:3, borderLeft:'2px solid var(--sf-gold)', lineHeight:1.6 }}>{QUIZ_DATA[idx].exp}</div>
            <button onClick={next} style={{ marginTop:9, padding:'7px 16px', background:'var(--sf-red)', color:'#fff', border:'none', borderRadius:3, fontFamily:'"Barlow Condensed"', fontSize:12, fontWeight:700, letterSpacing:1, textTransform:'uppercase', cursor:'pointer' }}>Next →</button>
          </>}
        </div>
      )}
    </div>
  )
}

function EventsTab() {
  const [sub,setSub]=useState<'upcoming'|'streams'|'clips'>('upcoming')
  const subTabs=[
    {id:'upcoming',label:'Upcoming',icon:'ti-calendar-event'},
    {id:'streams', label:'Streams', icon:'ti-player-play'},
    {id:'clips',   label:'Clips & VODs',icon:'ti-video'},
  ] as const
  const events=[
    {mo:'May',dy:'22',yr:'2026',mc:'var(--sf-red)',   name:'Combo Breaker 2026',      loc:'Schaumburg, IL · May 22–24',                  tags:['Next Event','CPT Premier','2x EWC spots'], tc:['var(--sf-red)','var(--sf-gold)','var(--sf-muted)'],   prize:'$19,710 SF6 pool',                    warn:'Capcom adds only $2,000',reg:'https://www.combobreakerchicago.com/',stream:'https://www.twitch.tv/capcomfighters'},
    {mo:'Jun',dy:'26',yr:'2026',mc:'var(--sf-gold)',  name:'EVO Las Vegas 2026',       loc:'Las Vegas Convention Center · Jun 26–28',     tags:['EVO Flagship','CPT Premier','2x EWC'],     tc:['var(--sf-gold)','var(--sf-gold)','var(--sf-muted)'],   prize:'TO-funded pool',                      warn:'$0 from Capcom',         reg:'https://www.start.gg/evo',              stream:'https://www.twitch.tv/evo'},
    {mo:'Jul',dy:'10',yr:'2026',mc:'var(--sf-green)', name:'BAM 16 — Melbourne',       loc:'Melbourne, Australia · First-ever Aus CPT',   tags:['New Premier','CPT Points'],               tc:['var(--sf-green)','var(--sf-muted)'],                   prize:'Prize TBA',                           warn:'',                       reg:'https://sf.esports.capcom.com/cpt/',   stream:'https://www.twitch.tv/capcomfighters'},
    {mo:'Jul',dy:'28',yr:'2026',mc:'var(--sf-gold)',  name:'Esports World Cup 2026',   loc:'Riyadh, Saudi Arabia · Jul 28–31 · 32 players',tags:['$1,000,000','Tier 1','CC13 qualifier'],  tc:['var(--sf-gold)','var(--sf-accent)','var(--sf-muted)'], prize:'$1,000,000 USD · Daigo & MenaRD in',  warn:'',                       reg:'https://esportsworldcup.com/',          stream:'https://www.twitch.tv/capcomfighters'},
    {mo:'Mar',dy:'??',yr:'2027',mc:'var(--sf-purple)',name:'Capcom Cup 13',             loc:'Ryogoku Kokugikan, Tokyo · World Championship',tags:['World Final','$1M+ Prize','48 Players'],  tc:['var(--sf-purple)','var(--sf-gold)','var(--sf-muted)'],  prize:'$2.1M total CPT season',             warn:'',                       reg:'https://sf.esports.capcom.com/cpt/',   stream:'https://sf.esports.capcom.com/cpt/'},
  ]
  const channels=[
    {name:'Capcom Fighters',sub:'Official Twitch · CPT live',       icon:'ti-brand-twitch', bg:'#6441a5',          url:'https://www.twitch.tv/capcomfighters'},
    {name:'Capcom Fighters',sub:'YouTube · VODs & highlights',       icon:'ti-brand-youtube',bg:'#FF0000',          url:'https://www.youtube.com/@CapcomFighters'},
    {name:'EVO Official',   sub:'Twitch · EVO Japan & Las Vegas',    icon:'ti-brand-twitch', bg:'#6441a5',          url:'https://www.twitch.tv/evo'},
    {name:'@CAPCOM_eSports',sub:'X · Schedules & live alerts',       icon:'ti-brand-x',      bg:'#000',             url:'https://twitter.com/CAPCOM_eSports'},
    {name:'Liquipedia SF6', sub:'Brackets · Results · Stats',        icon:'ti-chart-bar',    bg:'var(--sf-dark3)',  url:'https://liquipedia.net/fighters/Street_Fighter_6/Tournaments'},
    {name:'EventHubs SF6',  sub:'News · Tier lists · Frame data',    icon:'ti-news',         bg:'var(--sf-dark3)',  url:'https://www.eventhubs.com/news/sf6/'},
  ]
  const clips=[
    {bg:'linear-gradient(135deg,#1a0a2e,#2a1044)',title:'Capcom Cup 12 Grand Finals',      meta:'Mar 14, 2026 · Tokyo · Sahara wins',      sub:'Official VOD · $1,282,000 pool',        dur:'2:14:38',url:'https://www.youtube.com/@CapcomFighters'},
    {bg:'linear-gradient(135deg,#1a1000,#3a2200)',title:'EVO 2025 SF6 Top 8',              meta:'Aug 3, 2025 · Las Vegas · MenaRD wins',   sub:'Official VOD · EVO',                    dur:'1:48:22',url:'https://www.youtube.com/@CapcomFighters'},
    {bg:'linear-gradient(135deg,#0a1a0a,#1a3a1a)',title:'Alex Reveal Trailer — Year 3',   meta:'Mar 2026 · Year 3 DLC launch',            sub:'Official · Capcom Fighters',            dur:'0:45:11',url:'https://www.youtube.com/@CapcomFighters'},
    {bg:'linear-gradient(135deg,#1a1400,#3a2c00)',title:'Ingrid Reveal Trailer — Year 3', meta:'Season 3 · Newest DLC drop',              sub:'Official · Capcom Fighters',            dur:'0:38:29',url:'https://www.youtube.com/@CapcomFighters'},
    {bg:'linear-gradient(135deg,#1a1a2e,#0a0a1a)',title:'EVO 2024 Finals — Punk wins',    meta:'Jul 21, 2024 · 10,240 entrants',          sub:'Official VOD · EVO',                    dur:'1:22:04',url:'https://www.youtube.com/@CapcomFighters'},
    {bg:'linear-gradient(135deg,#0a0a0a,#1a0000)',title:"Daigo's EWC Qualification",      meta:'2025 · SFL World Championship',           sub:'The Beast qualifies for $1M Riyadh',    dur:'0:52:18',url:'https://www.youtube.com/@CapcomFighters'},
    {bg:'linear-gradient(135deg,#001422,#002244)',title:'Justin Wong: 30 Years of FGC',   meta:'Career highlights · Still competing SF6', sub:'Living legend · New York City',          dur:'0:38:44',url:'https://www.youtube.com/@CapcomFighters'},
  ]
  return (
    <div>
      <div style={{ display:'flex', background:'var(--sf-dark3)', borderBottom:'1px solid var(--sf-border)', overflowX:'auto', padding:'0 8px', gap:2, marginBottom:16, borderRadius:'4px 4px 0 0' }}>
        {subTabs.map(t=><button key={t.id} onClick={()=>setSub(t.id as typeof sub)} style={{ padding:'8px 10px', fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:sub===t.id?'var(--sf-red)':'var(--sf-muted)', background:'none', border:'none', borderBottom:`2px solid ${sub===t.id?'var(--sf-red)':'transparent'}`, cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}><i className={`ti ${t.icon}`} style={{ fontSize:11 }}/>{t.label}</button>)}
      </div>
      {sub==='upcoming'&&(<>
        <div style={{ background:'rgba(232,28,42,0.05)', border:'1px solid rgba(232,28,42,0.16)', borderRadius:3, padding:'9px 12px', marginBottom:12, display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--sf-red)', flexShrink:0 }} className="animate-blink"/>
          <div style={{ flex:1, fontSize:11, color:'var(--sf-red)' }}><strong>CPT 2026 World Warrior Japan — Active</strong> · @CAPCOM_eSports</div>
          <a href="https://www.twitch.tv/capcomfighters" target="_blank" rel="noopener" style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'5px 11px', background:'var(--sf-red)', color:'#fff', borderRadius:2, textDecoration:'none', flexShrink:0 }}>Watch</a>
        </div>
        <div style={{ background:'rgba(255,102,102,0.04)', border:'1px solid rgba(255,102,102,0.16)', borderRadius:3, padding:'9px 12px', marginBottom:12, fontSize:11, color:'#ccaaaa', lineHeight:1.55 }}>
          ⚠ <strong style={{ color:'#ff6666' }}>Prize note:</strong> Capcom contributes $2,000 to Premier winners. EVO 2026 gets $0. Big money ($1M+) reserved for CC13 Japan 2027.
        </div>
        <SL>CPT 2026 · Now through 2027</SL><ST>Full Schedule</ST>
        {events.map((ev,i)=>(
          <div key={i} style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, padding:'11px 12px', display:'flex', gap:10, alignItems:'flex-start', marginBottom:7 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:44, flexShrink:0, background:'var(--sf-dark3)', border:'1px solid var(--sf-border)', borderRadius:3, padding:'6px 3px' }}>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:ev.mc }}>{ev.mo}</div>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:20, fontWeight:900, color:'#fff', lineHeight:1 }}>{ev.dy}</div>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:7, color:'var(--sf-muted)' }}>{ev.yr}</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:13, fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:.3, lineHeight:1, marginBottom:2 }}>{ev.name}</div>
              <div style={{ fontSize:10, color:'var(--sf-muted)', marginBottom:4 }}>{ev.loc}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginBottom:4 }}>{ev.tags.map((t,ti)=><span key={t} style={{ fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, textTransform:'uppercase', padding:'1px 5px', borderRadius:2, border:`1px solid ${ev.tc[ti]}`, color:ev.tc[ti] }}>{t}</span>)}</div>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:12, fontWeight:700, color:'var(--sf-gold)' }}>{ev.prize}</div>
              {ev.warn&&<div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, color:'#ff6666', marginTop:2 }}>⚠ {ev.warn}</div>}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
              <a href={ev.reg} target="_blank" rel="noopener" style={{ fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', padding:'4px 9px', borderRadius:2, background:'var(--sf-red)', border:'1px solid var(--sf-red)', color:'#fff', textDecoration:'none', textAlign:'center' as const }}>Info</a>
              <a href={ev.stream} target="_blank" rel="noopener" style={{ fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', padding:'4px 9px', borderRadius:2, background:'none', border:'1px solid var(--sf-border)', color:'var(--sf-muted)', textDecoration:'none', textAlign:'center' as const }}>Stream</a>
            </div>
          </div>
        ))}
      </>)}
      {sub==='streams'&&(<>
        <SL>Official Channels</SL><ST>Where to Watch</ST>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:14 }}>
          {channels.map((ch,i)=>(
            <a key={i} href={ch.url} target="_blank" rel="noopener" style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, padding:10, display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
              <div style={{ width:38, height:38, background:ch.bg, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><i className={`ti ${ch.icon}`} style={{ color:'#fff', fontSize:16 }}/></div>
              <div><div style={{ fontFamily:'"Barlow Condensed"', fontSize:12, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:.3, lineHeight:1 }}>{ch.name}</div><div style={{ fontSize:9, color:'var(--sf-muted)', marginTop:1 }}>{ch.sub}</div></div>
              <i className="ti ti-external-link" style={{ marginLeft:'auto', color:'var(--sf-muted)', fontSize:12 }}/>
            </a>
          ))}
        </div>
      </>)}
      {sub==='clips'&&(<>
        <SL>CC12 · EVO 2025 · EVO 2024 · Legends</SL><ST>Tournament Highlights & VODs</ST>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:14 }}>
          {clips.map((c,i)=>(
            <a key={i} href={c.url} target="_blank" rel="noopener" style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, overflow:'hidden', textDecoration:'none', display:'block' }}>
              <div style={{ width:'100%', aspectRatio:'16/9', background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(232,28,42,0.85)', display:'flex', alignItems:'center', justifyContent:'center' }}><i className="ti ti-player-play" style={{ color:'#fff', fontSize:14 }}/></div>
                <div style={{ position:'absolute', bottom:4, right:4, fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, padding:'1px 5px', background:'rgba(0,0,0,0.85)', borderRadius:2, color:'#fff' }}>{c.dur}</div>
              </div>
              <div style={{ padding:'8px 10px' }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:11, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:.3, lineHeight:1.3, marginBottom:2 }}>{c.title}</div>
                <div style={{ fontSize:10, color:'var(--sf-muted)' }}>{c.meta}</div>
                <div style={{ fontSize:9, color:'var(--sf-red)', marginTop:1, fontFamily:'"Barlow Condensed"', fontWeight:600, textTransform:'uppercase' }}>{c.sub}</div>
              </div>
            </a>
          ))}
        </div>
        <div style={{ textAlign:'center' }}><a href="https://www.youtube.com/@CapcomFighters" target="_blank" rel="noopener" style={{ fontFamily:'"Barlow Condensed"', fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'9px 22px', background:'var(--sf-red)', color:'#fff', borderRadius:3, textDecoration:'none', display:'inline-block' }}>All VODs on YouTube →</a></div>
      </>)}
    </div>
  )
}

function PlayersTab() {
  const [sel, setSel] = useState<string|null>(null)
  const players = [
    { key:'endingwalker', name:'EndingWalker',  flag:'🇩🇪', team:'MOUZ',      main:'Ryu',      badge:'🔥 Season 3 — 10-0 SFL',       bc:'var(--sf-green)',  bigStat:'10-0', bigLabel:'SFL record',    era:'Current',
      bio:"The most in-form player in SF6. His 10-0 SFL run with Ryu proves the character is elite in Season 3. Patient, methodical play maximises every Elena update buff.",
      playstyle:"EndingWalker is the definition of patient, methodical play. He maximizes every advantage, never takes risks, and wins through superior neutral and anti-air discipline. His Ryu play proves fundamentals still dominate — no gimmicks, just frame-perfect execution and deep matchup knowledge.",
      rivalry:"Watch his sets against Tokido — two fundamentals-first players with different philosophical approaches to neutral.",
      moment:"Going 10-0 in SFL Season 3 with a character most players had written off after Season 2. A statement that redefined Ryu's place in the meta.",
      timeline:[{yr:'2019',ev:'Begins competing locally in Germany'},{yr:'2021',ev:'First international tournament appearance'},{yr:'2023',ev:'Signs with MOUZ esports'},{yr:'2024',ev:'Multiple CPT top 8 placements'},{yr:'2025',ev:'SFL Season 3 — historic 10-0 record with Ryu'},{yr:'2026',ev:'MOUZ top seed heading into Combo Breaker'}],
      stats:{neutralIQ:92,execution:88,adaptation:90,drive:85,clutch:87}, tags:['Patient neutral','Denjin charge','Anti-air discipline','Punish-first'], results:[{ev:'SFL Season 3',char:'Ryu',place:'10-0',prize:'Top seed'},{ev:'CC12',char:'Ryu',place:'Top 8',prize:'Qualified'}] },
    { key:'punk',         name:'Punk',          flag:'🇺🇸', team:'FLY',       main:'Luke',     badge:'EVO 2024 Champion',            bc:'var(--sf-gold)',   bigStat:'EVO',  bigLabel:'2024 Champ',    era:'Current',
      bio:"Benchmark of SF6 dominance. EVO 2024 win against 10,240 entrants cemented his legacy. Relentless Drive Rush pressure, high-damage corner carry, and pattern recognition that borders on predictive.",
      playstyle:"Punk plays with overwhelming confidence and reads opponents faster than almost anyone. His Drive Rush timing is frame-perfect, his corner carry routes optimized to pixel level, and his mental game is unmatched under pressure. He turns defense into offense in a single input.",
      rivalry:"Punk vs MenaRD — two of the most explosive offensive players in SF6, always a highlight reel when they meet.",
      moment:"EVO 2024 Grand Finals — navigating a 10,240-player bracket and claiming the championship. The largest SF6 EVO bracket in history.",
      timeline:[{yr:'2016',ev:'Emerges as teenage prodigy on the US circuit'},{yr:'2017',ev:'EVO top 8 at age 17 — FGC takes notice'},{yr:'2018',ev:'Multiple major wins establish him as America\'s best'},{yr:'2022',ev:'Signs with FlyQuest esports'},{yr:'2024',ev:'EVO 2024 Champion — defeats 10,240 entrants with Luke'},{yr:'2026',ev:'Defending his legacy heading into EVO Las Vegas'}],
      stats:{neutralIQ:94,execution:96,reads:92,drive:95,clutch:91}, tags:['Drive Rush master','Corner trap','Sand blast','High-dmg reads'], results:[{ev:'EVO 2024',char:'Luke',place:'1st',prize:'Champion'},{ev:'CC12',char:'Luke',place:'Top 16',prize:'Qualified'}] },
    { key:'tokido',       name:'Tokido',        flag:'🇯🇵', team:'REJECT',    main:'JP (S3)',  badge:'30+ EVO Top-8s · Legend',      bc:'var(--sf-purple)', bigStat:'30+',  bigLabel:'EVO Top-8s',    era:'Legend',
      bio:"One of the Five Japanese Gods. 30+ EVO Top-8s across multiple franchises. Switched to JP for Season 3 — believes the April fix left the character fundamentally dominant at highest level.",
      playstyle:"Tokido is the ultimate adaptor. He studies opponents between rounds and changes his entire gameplan based on what he sees. His mental fortitude under pressure is legendary — he gets more dangerous when he's losing.",
      rivalry:"Tokido vs Daigo — the eternal Japanese rivalry. Two Five Gods who have defined the FGC for over 20 years. Every set is must-watch.",
      moment:"The adversary in EVO Moment 37 — Daigo's legendary parry against Tokido's SA2 in 2004 is the most famous moment in FGC history. Both men made it immortal.",
      timeline:[{yr:'2004',ev:'First EVO appearance — immediately top 8'},{yr:'2009',ev:'EVO Champion — begins Five Gods legacy'},{yr:'2011',ev:'30+ EVO Top-8s across multiple titles'},{yr:'2022',ev:'Signs with REJECT esports'},{yr:'2024',ev:'Adapts to SF6 — multiple CPT Premier placements'},{yr:'2026',ev:'Switches to JP for Season 3'}],
      stats:{reads:97,adaptation:95,neutralIQ:96,mental:98,clutch:94}, tags:['Patient zoning','Punish-first','Round adaptation','Gauge management'], results:[{ev:'CPT Japan',char:'JP',place:'1st',prize:'Premier win'},{ev:'CC12',char:'JP',place:'Top 16',prize:'Qualified'}] },
    { key:'menard',       name:'MenaRD',        flag:'🇩🇴', team:'',          main:'TBC',      badge:'EVO 2025 Champion',            bc:'var(--sf-gold)',   bigStat:'EVO',  bigLabel:'2025 Champ',    era:'Current',
      bio:"Reigning EVO champion. Already qualified for EWC 2026 via the SFL World Championship. One of the first confirmed names in Riyadh's $1M field. Considered by many the best active player.",
      playstyle:"MenaRD is the most explosively offensive player in SF6. His execution is elite-level, damage output per touch is among the highest in the world, and he has a champion's mentality in Grand Finals.",
      rivalry:"MenaRD vs Punk — both explosive offensive players who bring out the best in each other. Two champions proving who is THE champion.",
      moment:"EVO 2025 Grand Finals — claiming the championship and cementing Dominican Republic's place as a global SF6 powerhouse.",
      timeline:[{yr:'2015',ev:'Begins competing in Dominican Republic'},{yr:'2018',ev:'First international appearance — immediate impact'},{yr:'2019',ev:'EVO top 8 — DR on the FGC map'},{yr:'2022',ev:'Multiple Capcom Cup appearances'},{yr:'2025',ev:'EVO 2025 Champion'},{yr:'2026',ev:'EWC 2026 qualified — Riyadh $1M'}],
      stats:{aggression:95,execution:93,adaptation:88,clutch:94,drive:90}, tags:['Explosive offense','High-dmg combos','Mental resilience','GF performer'], results:[{ev:'EVO 2025',char:'TBC',place:'1st',prize:'Champion'},{ev:'EWC 2026',char:'TBC',place:'Qualified',prize:'$1M pool'}] },
    { key:'daigo',        name:'Daigo Umehara', flag:'🇯🇵', team:'ROHTO/Zst.',main:'Ryu/Ken',  badge:'The Beast · Living Legend',    bc:'var(--sf-red)',    bigStat:'EWC',  bigLabel:'2026 Qualified', era:'Legend',
      bio:"The most famous player in fighting game history. First EVO champion. Multiple SF titles across decades. Qualified for EWC 2026 Riyadh at age 42 via the SFL World Championship.",
      playstyle:"Daigo fights with absolute fundamentals. Every input is purposeful, every movement calculated. He wins through superior spacing and punish accuracy. His ability to adapt mid-set is unmatched — he reads opponents better in round 3 than most players do in practice.",
      rivalry:"Daigo vs Tokido — the defining rivalry of Japanese fighting games spanning 25+ years. Two Five Gods who push each other to greatness.",
      moment:"EVO Moment 37, 2004 — parrying all 15 hits of Chun-Li's Super Art at pixel health and countering for the win. Over 10 million views. The most famous moment in FGC history.",
      timeline:[{yr:'2000',ev:'First major tournament wins in Japan'},{yr:'2003',ev:'First EVO Championship'},{yr:'2004',ev:'EVO Moment 37 — FGC history made'},{yr:'2009',ev:'Multiple SF4 EVO championships'},{yr:'2022',ev:'Adapts to SF6 at age 40'},{yr:'2025',ev:'Qualifies for EWC 2026 at age 42'}],
      stats:{neutralIQ:98,reads:97,adaptation:94,legacy:100,clutch:96}, tags:['Fundamentals','Parry god','Ryu specialist','Iron will'], results:[{ev:'SFL WC',char:'Ken',place:'Qualified',prize:'EWC 2026'},{ev:'EVO 2004',char:'Ryu',place:'The Parry',prize:'FGC Forever'}] },
    { key:'justinwong',   name:'Justin Wong',   flag:'🇺🇸', team:'EG Alumni', main:'Various',  badge:'8x EVO Champion · NYC Legend', bc:'#0066cc',          bigStat:'8x',   bigLabel:'EVO Champ',     era:'Legend',
      bio:"One of the greatest American players in FGC history. 8 EVO championships across multiple franchises. Still competing at SF6 Season 3 majors after 30+ years. Justin Wong is the reason the American FGC exists.",
      playstyle:"Justin Wong is the mind game master. His reads are almost supernatural — built from 27 years playing against the best. He adapts between rounds faster than anyone and uses character-switching as a psychological weapon.",
      rivalry:"Justin Wong vs Daigo — the East vs West rivalry that drew millions of viewers to the FGC. A rivalry that helped build the entire modern scene.",
      moment:"EVO 2004 MvC2 comeback — came back from seemingly impossible odds against 5 opponents at near-zero health. The greatest comeback in FGC history.",
      timeline:[{yr:'1999',ev:'Begins competing in NYC arcade scene'},{yr:'2001',ev:'First EVO Championship'},{yr:'2001-2014',ev:'8 EVO Championships across multiple titles'},{yr:'2015',ev:'Joins Evil Geniuses'},{yr:'2020',ev:'Content creation and community building'},{yr:'2026',ev:'Still competing at SF6 majors — 27 years on'}],
      stats:{neutralIQ:96,reads:98,adaptation:97,mentorship:100,clutch:95}, tags:['All-rounder','Mind games','Tournament veteran','Community builder'], results:[{ev:'Multiple EVOs',char:'Various',place:'8x Champion',prize:'FGC Icon'},{ev:'SF6 Majors S3',char:'Various',place:'Still competing',prize:'Legacy'}] },
    { key:'angrybird',    name:'AngryBird',     flag:'🇦🇪', team:'',          main:'Rashid',   badge:'EVO 2023 Champion',            bc:'var(--sf-green)',  bigStat:'EVO',  bigLabel:'2023 Champ',    era:'Current',
      bio:"The first ever SF6 EVO champion. Put the Middle Eastern FGC on the world stage at EVO 2023 with dominant Rashid play. A historic moment for regional representation in the FGC.",
      playstyle:"AngryBird plays Rashid with surgical precision. His wind pressure timing is perfectly calibrated, his Drive Rush confirms crisp, and he has an uncanny ability to identify and exploit opponent patterns mid-match.",
      rivalry:"Watch his sets against Japanese players — his neutral game holds up against the best in the world, proving the Middle Eastern FGC is world-class.",
      moment:"EVO 2023 Grand Finals — winning SF6's first ever EVO championship, putting UAE and Middle Eastern FGC on the global map permanently.",
      timeline:[{yr:'2018',ev:'Begins competing in UAE local scene'},{yr:'2020',ev:'First international online wins'},{yr:'2022',ev:'EVO Online — Middle Eastern FGC emerges'},{yr:'2023',ev:'EVO 2023 Champion with Rashid — first ever SF6 EVO champ'},{yr:'2024',ev:'Multiple CPT Premier top 8 appearances'},{yr:'2026',ev:'Continuing CPT campaign'}],
      stats:{neutralIQ:90,execution:92,reads:88,adaptation:86,clutch:93}, tags:['Rashid expert','Wind pressure','First SF6 EVO champ','Regional pride'], results:[{ev:'EVO 2023',char:'Rashid',place:'1st',prize:'First SF6 EVO Champ'},{ev:'CPT Circuit',char:'Rashid',place:'Top 8s',prize:'Multiple'}] },
    { key:'nuckledu',     name:'NuckleDu',      flag:'🇺🇸', team:'',          main:'Guile',    badge:'EVO 2016 Champion',            bc:'#4a7a4a',          bigStat:'EVO',  bigLabel:'2016 Champ',    era:'Legend',
      bio:"EVO 2016 champion. His SF6 Guile play is textbook defensive excellence — Sonic Boom walls, Flash Kick reactions, walk-back punish game that defines the character at highest level.",
      playstyle:"NuckleDu is the textbook defensive master. His Sonic Boom walls are perfectly timed, Flash Kick reactions frame-perfect, and his walk-back punish game punishes every overextension. He makes opponents feel like they cannot touch him.",
      rivalry:"NuckleDu vs Punk — the American veterans who defined a generation of US Street Fighter. Two different styles, both elite.",
      moment:"EVO 2016 Grand Finals — claiming the championship in dominant fashion, cementing his place among America's all-time greats.",
      timeline:[{yr:'2012',ev:'Emerges as Guile specialist on the American circuit'},{yr:'2014',ev:'First major tournament win'},{yr:'2016',ev:'EVO 2016 Champion with Nash/Guile'},{yr:'2018-2022',ev:'Consistent top placements SF4 and SF5'},{yr:'2023',ev:'Adapts to SF6 with Guile'},{yr:'2026',ev:'Still competing — one of America\'s most consistent'}],
      stats:{neutralIQ:94,defense:97,reads:93,adaptation:88,clutch:90}, tags:['Guile specialist','Defensive master','Walk-back punish','Consistent placer'], results:[{ev:'EVO 2016',char:'Nash',place:'1st',prize:'EVO Champion'},{ev:'SF6 CPT',char:'Guile',place:'Multiple Top 8s',prize:'Consistent'}] },
    { key:'sahara',       name:'Sahara',        flag:'🇯🇵', team:'',          main:'Ryu',      badge:'Capcom Cup 12 Champion',       bc:'var(--sf-gold)',   bigStat:'CC12', bigLabel:'Champion',      era:'Current',
      bio:"Freshly crowned Capcom Cup 12 champion. Sahara's Ryu run through a stacked Tokyo bracket is the loudest proof yet that Season 3 Ryu is legitimately elite — the same story EndingWalker has been telling all year.",
      playstyle:"Sahara plays textbook Season 3 Ryu — patient neutral, disciplined anti-airs, and Denjin Hadoken zoning that punishes any hesitation. What separates her is composure: she doesn't flinch in bracket resets, and her punish-counter conversions in Grand Finals were some of the cleanest of the tournament.",
      rivalry:"Sahara vs EndingWalker — two Ryu specialists from different regions both proving Season 3 Ryu is a genuine top-tier pick, not a fluke.",
      moment:"Capcom Cup 12 Grand Finals, March 2026 — closing out a stacked $1,282,000 Tokyo bracket with Ryu, validating the character's post-Elena resurgence in front of a home crowd.",
      timeline:[{yr:'2019',ev:'Begins competing on the Japanese regional circuit'},{yr:'2021',ev:'First notable CPT Japan placements'},{yr:'2023',ev:'Consistent top 8s establish her as a Ryu specialist to watch'},{yr:'2025',ev:'Qualifies for Capcom Cup 12 via CPT points'},{yr:'2026',ev:'Capcom Cup 12 Champion — Tokyo Grand Finals'}],
      stats:{neutralIQ:93,execution:91,reads:90,drive:88,clutch:96}, tags:['Season 3 Ryu proof','Denjin zoning','CC12 Champion','Punish Counter specialist'], results:[{ev:'CC12',char:'Ryu',place:'1st',prize:'$350,000+'},{ev:'EWC 2026',char:'Ryu',place:'Qualified',prize:'$1M pool'}] },
    { key:'kawano',       name:'Kawano',        flag:'🇯🇵', team:'',          main:'Chun-Li/Akuma', badge:'CC12 Top 8 · Dual Threat', bc:'var(--sf-accent)', bigStat:'2',    bigLabel:'CC12 chars used', era:'Current',
      bio:"One of the few players elite enough to run two S-tier characters in the same event. Kawano's Chun-Li footsies and Akuma punish game both reached Capcom Cup 12 top 8.",
      playstyle:"Kawano switches between Chun-Li's patient poke-and-chip neutral and Akuma's all-in punish windows depending on the matchup — a character-select mind game most players can't replicate credibly at his execution level.",
      rivalry:"Kawano vs Sahara — the CC12 storyline of two standouts pushing character mastery to its ceiling.",
      moment:"Capcom Cup 12 top 8 — the first player in the tournament to bench a second S-tier character mid-run and win with it.",
      timeline:[{yr:'2020',ev:'Rises through the Japanese SF6 launch scene'},{yr:'2022',ev:'First CPT Japan regional win'},{yr:'2023',ev:'Adds Akuma as a secondary in tournament play'},{yr:'2024',ev:'Multiple Premier top 8s across both characters'},{yr:'2025',ev:'Qualifies for CC12'},{yr:'2026',ev:'CC12 Top 8 with two different characters'}],
      stats:{execution:96,adaptation:94,neutralIQ:90,reads:91,clutch:88}, tags:['Dual-character threat','Chun-Li footsies','Akuma punish game','Character-select mind games'], results:[{ev:'CC12',char:'Chun-Li/Akuma',place:'Top 8',prize:'Qualified'},{ev:'CPT Japan',char:'Chun-Li',place:'1st',prize:'Regional win'}] },
    { key:'nemo',         name:'Nemo',          flag:'🇰🇷', team:'',          main:'Zangief',  badge:'Grappler Specialist',          bc:'#880000',          bigStat:'B-tier', bigLabel:'proof of concept', era:'Current',
      bio:"The most prominent Zangief player at international level, proving the Red Cyclone still terrifies opponents when every SPD is a threat. Nemo's defensive reads open the door for devastating momentum swings.",
      playstyle:"Nemo plays a patient waiting game — absorbing pressure behind Zangief's armor and defense stats until one read lands. A single SPD from Nemo changes an entire set's momentum, and he knows exactly when to gamble.",
      rivalry:"Nemo vs zoning specialists — his matches against fireball characters are must-watch clinics on closing distance against the run-away game plan.",
      moment:"A tournament-defining SPD read against a heavily favored opponent at a CPT regional, turning a near-elimination set into a comeback win.",
      timeline:[{yr:'2019',ev:'Begins competing on the South Korean circuit'},{yr:'2021',ev:"Establishes himself as the region's top Zangief"},{yr:'2023',ev:'First international CPT regional placement'},{yr:'2024',ev:'Multiple online and offline grappler showcase wins'},{yr:'2025',ev:'Continues as the benchmark Zangief at every major he enters'},{yr:'2026',ev:'Competing for a Season 3 CPT points push'}],
      stats:{defense:96,reads:93,patience:97,power:92,clutch:90}, tags:['SPD reads','Armor discipline','Momentum swings','Grappler benchmark'], results:[{ev:'CPT Korea',char:'Zangief',place:'1st',prize:'Regional win'},{ev:'CC12',char:'Zangief',place:'Top 32',prize:'Qualified'}] },
    { key:'fuudo',        name:'Fuudo',         flag:'🇯🇵', team:'',          main:'Dhalsim',  badge:'Dhalsim Veteran',              bc:'#CC6600',          bigStat:'C-tier', bigLabel:'made lethal',   era:'Legend',
      bio:"A historically prominent Dhalsim player who has proven the longest limbs in the game can still win at the highest level, generation after generation of Street Fighter.",
      playstyle:"Fuudo plays spacing chess — using Dhalsim's absurd range to control exactly where a match happens, then punishing any approach with fire and limbs before it lands. Teleport mix-ups arrive exactly when opponents think they're safe.",
      rivalry:"Fuudo vs rushdown specialists — his sets are the definitive teaching tape on how patience beats aggression when the spacing is right.",
      moment:"A signature teleport-mix comeback at a major SF6 event, turning what looked like a lost round into a highlight-reel win purely on spacing mastery.",
      timeline:[{yr:'2008',ev:'Establishes himself in the Japanese arcade scene'},{yr:'2012',ev:'Multiple major placements across SF4'},{yr:'2019',ev:'Continues Dhalsim mastery into SFV'},{yr:'2023',ev:'Adapts Dhalsim to SF6 Drive system'},{yr:'2025',ev:'Still competing at Premiers with a C-tier character'},{yr:'2026',ev:'Proof that character loyalty still wins rounds'}],
      stats:{neutralIQ:95,reads:92,patience:98,execution:90,clutch:87}, tags:['Longest limbs','Spacing chess','Teleport mix','Character loyalty'], results:[{ev:'Multiple Premiers',char:'Dhalsim',place:'Various Top 8s',prize:'Sustained excellence'},{ev:'CC12',char:'Dhalsim',place:'Qualified',prize:'Season 3'}] },
  ]
  const active = sel ? players.find(p=>p.key===sel) : null
  return (
    <div>
      <SL>CPT 2026 · Current players and FGC legends</SL><ST>Elite Player Dossiers</ST>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:8, marginBottom:16 }}>
        {players.map(p=>(
          <div key={p.key} onClick={()=>setSel(sel===p.key?null:p.key)} style={{ background:'var(--sf-dark2)', border:`2px solid ${sel===p.key?'var(--sf-red)':'var(--sf-border)'}`, borderRadius:4, overflow:'hidden', cursor:'pointer', transition:'border-color 0.15s' }}>
            <div style={{ width:'100%', aspectRatio:'1', overflow:'hidden', background:'#1a1a2e' }}>
              <img src={`/players/${p.key}.jpg`} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} onError={(e)=>{ const t=e.target as HTMLImageElement; t.style.display='none'; t.parentElement!.innerHTML=PLAYER_PORTRAITS[p.key]||''; }}/>
            </div>
            <div style={{ padding:'8px 9px' }}>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:12, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:.3, lineHeight:1, marginBottom:2 }}>{p.name}</div>
              <div style={{ fontSize:9, color:'var(--sf-muted)' }}>{p.flag} · {p.main}</div>
              <span style={{ fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, padding:'1px 5px', borderRadius:2, border:`1px solid ${p.bc}`, color:p.bc, display:'inline-block', marginTop:4 }}>{p.era}</span>
            </div>
          </div>
        ))}
      </div>
      {active && (
        <div style={{ background:'var(--sf-dark2)', border:'2px solid var(--sf-red)', borderRadius:4, overflow:'hidden', marginBottom:12 }}>
          <div style={{ background:'var(--sf-dark3)', borderBottom:'1px solid var(--sf-border)', display:'flex', gap:0, alignItems:'stretch' }}>
            <div style={{ width:120, height:120, flexShrink:0, overflow:'hidden', background:'#1a1a2e' }}>
              <img src={`/players/${active.key}.jpg`} alt={active.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} onError={(e)=>{ const t=e.target as HTMLImageElement; t.style.display='none'; t.parentElement!.innerHTML=PLAYER_PORTRAITS[active.key]||''; }}/>
            </div>
            <div style={{ flex:1, padding:'12px 14px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:20, fontWeight:900, color:'#fff', textTransform:'uppercase', lineHeight:1 }}>{active.name}</div>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:10, color:'var(--sf-muted)', textTransform:'uppercase', letterSpacing:.5, marginTop:2 }}>{active.team&&`${active.team} · `}{active.flag} · {active.main}</div>
                <span style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', padding:'2px 7px', borderRadius:2, border:`1px solid ${active.bc}`, color:active.bc, display:'inline-block', marginTop:6 }}>{active.badge}</span>
              </div>
              <div style={{ marginTop:8 }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:22, fontWeight:900, color:'var(--sf-red)', lineHeight:1 }}>{active.bigStat}</div>
                <div style={{ fontSize:9, color:'var(--sf-muted)', textTransform:'uppercase' }}>{active.bigLabel}</div>
              </div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${Object.keys(active.stats).length},1fr)`, gap:5, padding:'10px 14px', borderBottom:'1px solid var(--sf-border)' }}>
            {Object.entries(active.stats).map(([k,v])=>(
              <div key={k} style={{ background:'var(--sf-dark3)', borderRadius:3, padding:'7px 6px', textAlign:'center' }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:15, fontWeight:900, color:'#fff', lineHeight:1 }}>{v}</div>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:7, fontWeight:700, textTransform:'uppercase', color:'var(--sf-muted)', marginTop:1 }}>{k.replace(/([A-Z])/g,' $1').trim()}</div>
              </div>
            ))}
          </div>
          <div style={{ padding:'11px 14px' }}>
            <p style={{ fontSize:12, color:'#aaaacc', lineHeight:1.65, marginBottom:9 }}>{active.bio}</p>
            {(active as any).playstyle && (
              <div style={{ marginBottom:10, padding:'9px 11px', background:'rgba(0,212,255,0.04)', border:'1px solid rgba(0,212,255,0.14)', borderRadius:3 }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-accent)', marginBottom:4 }}>Playstyle</div>
                <p style={{ fontSize:11, color:'#aaaacc', lineHeight:1.6, margin:0 }}>{(active as any).playstyle}</p>
              </div>
            )}
            {(active as any).moment && (
              <div style={{ marginBottom:10, padding:'9px 11px', background:'rgba(245,166,35,0.04)', border:'1px solid rgba(245,166,35,0.14)', borderRadius:3 }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-gold)', marginBottom:4 }}>⚡ Signature Moment</div>
                <p style={{ fontSize:11, color:'#aaaacc', lineHeight:1.6, margin:0 }}>{(active as any).moment}</p>
              </div>
            )}
            {(active as any).rivalry && (
              <div style={{ marginBottom:10, padding:'9px 11px', background:'rgba(232,28,42,0.04)', border:'1px solid rgba(232,28,42,0.14)', borderRadius:3 }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-red)', marginBottom:4 }}>🔥 Key Rivalry</div>
                <p style={{ fontSize:11, color:'#aaaacc', lineHeight:1.6, margin:0 }}>{(active as any).rivalry}</p>
              </div>
            )}
            {(active as any).timeline && (
              <div style={{ marginBottom:10 }}>
                <div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-muted)', marginBottom:6 }}>Career Timeline</div>
                <div style={{ position:'relative', paddingLeft:16 }}>
                  <div style={{ position:'absolute', left:4, top:0, bottom:0, width:1, background:'var(--sf-border)' }}/>
                  {(active as any).timeline.map((t: any, ti: number)=>(
                    <div key={ti} style={{ display:'flex', gap:8, marginBottom:5, position:'relative' }}>
                      <div style={{ position:'absolute', left:-12, top:5, width:6, height:6, borderRadius:'50%', background:'var(--sf-red)', flexShrink:0 }}/>
                      <div style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, color:'var(--sf-red)', flexShrink:0, width:36 }}>{t.yr}</div>
                      <div style={{ fontSize:11, color:'var(--sf-muted)', lineHeight:1.4 }}>{t.ev}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginBottom:9 }}>{active.tags.map((t: string)=><span key={t} style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, textTransform:'uppercase', padding:'1px 6px', border:'1px solid var(--sf-border)', borderRadius:2, color:'var(--sf-muted)' }}>{t}</span>)}</div>
            <div style={{ fontFamily:'"Barlow Condensed"', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-muted)', marginBottom:5 }}>Career Results</div>
            <div style={{ background:'var(--sf-dark3)', borderRadius:3, overflow:'hidden', marginBottom:8 }}>
              {active.results.map((r: any,ri: number)=>(
                <div key={ri} style={{ display:'grid', gridTemplateColumns:'90px 1fr auto auto', gap:7, padding:'6px 9px', borderBottom:ri<active.results.length-1?'1px solid var(--sf-border)':'none', alignItems:'center' }}>
                  <div style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, color:'#fff', textTransform:'uppercase' }}>{r.ev}</div>
                  <div style={{ fontSize:9, color:'var(--sf-muted)' }}>{r.char}</div>
                  <div style={{ fontFamily:'"Barlow Condensed"', fontSize:11, fontWeight:700, color:'var(--sf-gold)' }}>{r.place}</div>
                  <div style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, color:'var(--sf-green)' }}>{r.prize}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setSel(null)} style={{ fontSize:11, fontFamily:'"Barlow Condensed"', fontWeight:700, letterSpacing:.5, textTransform:'uppercase', padding:'5px 12px', border:'1px solid var(--sf-border)', borderRadius:2, background:'transparent', color:'var(--sf-muted)', cursor:'pointer' }}>Close ✕</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultsTab() {
  const events = [
    { name:'Capcom Cup 12', meta:'Mar 11–15, 2026 · Ryogoku Kokugikan, Tokyo · 48 players', prize:'$1,282,000', url:'https://liquipedia.net/fighters/Street_Fighter_6/Tournaments', results:[
      { pos:'1st', pc:'var(--sf-gold)', player:'Sahara', char:'Ryu', country:'🇯🇵', prize:'$350,000+', note:'' },
      { pos:'2nd', pc:'#ccc', player:'Kilzyou', char:'TBC', country:'🇯🇵', prize:'$120,000+', note:'' },
      { pos:'Note', pc:'#888', player:'Kawano on Akuma · Multiple Ryu in top 8 · Validates post-Elena Ryu', char:'', country:'', prize:'', note:'Liquipedia' },
    ] },
    { name:'EVO 2025', meta:'Aug 1–3, 2025 · Las Vegas · 8,541 entrants', prize:'Champion crowned', url:'https://www.start.gg/evo', results:[
      { pos:'1st', pc:'var(--sf-gold)', player:'MenaRD', char:'TBC', country:'🇩🇴', prize:'EVO Champion', note:'' },
      { pos:'Info', pc:'#888', player:'8,541 entrants · Daigo qualifies for EWC 2026 via SFL WC', char:'', country:'', prize:'', note:'start.gg' },
    ] },
    { name:'EVO 2024', meta:'Jul 19–21, 2024 · Las Vegas · 10,240 entrants — SF6 record', prize:'Record entry', url:'https://www.start.gg/evo', results:[
      { pos:'1st', pc:'var(--sf-gold)', player:'Punk', char:'Luke', country:'🇺🇸', prize:'EVO Champion', note:'' },
      { pos:'Info', pc:'#888', player:'10,240 entrants · Largest SF6 EVO bracket in history', char:'', country:'', prize:'', note:'start.gg' },
    ] },
    { name:'EVO 2023 — SF6 World Premiere', meta:'Aug 4–6, 2023 · Las Vegas · First EVO for Street Fighter 6', prize:'History made', url:'https://liquipedia.net/fighters/Street_Fighter_6/Tournaments', results:[
      { pos:'1st', pc:'var(--sf-gold)', player:'AngryBird', char:'Rashid', country:'🇦🇪', prize:'First SF6 EVO Champ', note:'' },
      { pos:'Info', pc:'#888', player:'9,221 entrants · First-ever SF6 EVO champion · Middle Eastern FGC on world stage', char:'', country:'', prize:'', note:'Full story' },
    ] },
  ]
  return (
    <div>
      <SL>Full match history</SL><ST>Results Hub</ST>
      {events.map((ev,i)=>(
        <div key={i} style={{ background:'var(--sf-dark2)', border:'1px solid var(--sf-border)', borderRadius:4, overflow:'hidden', marginBottom:9 }}>
          <div style={{ background:'var(--sf-dark3)', borderBottom:'1px solid var(--sf-border)', padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'"Barlow Condensed"', fontSize:14, fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:.3 }}>{ev.name}</div>
              <div style={{ fontSize:10, color:'var(--sf-muted)', marginTop:1 }}>{ev.meta}</div>
            </div>
            <div style={{ fontFamily:'"Barlow Condensed"', fontSize:13, fontWeight:700, color:'var(--sf-gold)', flexShrink:0 }}>{ev.prize}</div>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Pos','Player','Main','','Prize',''].map((h,hi)=><th key={hi} style={{ textAlign:'left', padding:'6px 12px', fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--sf-muted)', borderBottom:'1px solid var(--sf-border)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {ev.results.map((r,ri)=>(
                <tr key={ri}>
                  <td style={{ padding:'8px 12px', borderBottom:ri<ev.results.length-1?'1px solid var(--sf-border)':'none' }}><span style={{ fontFamily:'"Barlow Condensed"', fontSize:13, fontWeight:900, color:r.pc }}>{r.pos}</span></td>
                  <td style={{ padding:'8px 12px', borderBottom:ri<ev.results.length-1?'1px solid var(--sf-border)':'none' }}><span style={{ fontFamily:'"Barlow Condensed"', fontSize:12, fontWeight:700, color:'#fff', textTransform:'uppercase' }}>{r.player}</span></td>
                  <td style={{ padding:'8px 12px', borderBottom:ri<ev.results.length-1?'1px solid var(--sf-border)':'none', fontSize:10, color:'var(--sf-muted)' }}>{r.char}</td>
                  <td style={{ padding:'8px 12px', borderBottom:ri<ev.results.length-1?'1px solid var(--sf-border)':'none', fontSize:13 }}>{r.country}</td>
                  <td style={{ padding:'8px 12px', borderBottom:ri<ev.results.length-1?'1px solid var(--sf-border)':'none' }}><span style={{ fontFamily:'"Barlow Condensed"', fontSize:11, fontWeight:700, color:'var(--sf-gold)' }}>{r.prize}</span></td>
                  <td style={{ padding:'8px 12px', borderBottom:ri<ev.results.length-1?'1px solid var(--sf-border)':'none' }}>{r.note && <a href={ev.url} target="_blank" rel="noopener" style={{ fontFamily:'"Barlow Condensed"', fontSize:8, fontWeight:700, textTransform:'uppercase', color:'var(--sf-accent)', textDecoration:'none' }}>{r.note} ↗</a>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <a href="https://liquipedia.net/fighters/Street_Fighter_6/Tournaments" target="_blank" rel="noopener" style={{ fontFamily:'"Barlow Condensed"', fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'6px 12px', background:'var(--sf-red)', border:'none', borderRadius:3, color:'#fff', textDecoration:'none', display:'inline-block' }}>All results on Liquipedia ↗</a>
    </div>
  )
}
