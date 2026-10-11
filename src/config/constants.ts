export const LEVELS = ['beginner','intermediate','advanced'] as const;
export type Level = typeof LEVELS[number];
export type Game = 'pairs'|'cakes'|'shop';
export const NAMES: Record<Game,string> = {pairs:'Plum Pairs',cakes:'Cozy Cakes',shop:'Plum Shop'};
export const PAIRS = {
 beginner:{boards:1,size:5,seconds:0,normalPairs:12,specials:[]},
 intermediate:{boards:2,size:6,seconds:180,normalPairs:15,specials:['clock','chef','peek']},
 advanced:{boards:4,size:8,seconds:240,normalPairs:27,specials:['joker','clock','chef','shuffle','peek']}
} as const;
export const PAIRS_TIMING={mismatchMs:800,peekMs:2000,clockBonus:20};
export const SHOP={beginner:{slots:['eyes','nose','mouth'],colors:['red','purple','yellow'],limit:0},intermediate:{slots:['topper','eyes','nose','mouth'],colors:['red','purple','yellow','blue'],limit:8},advanced:{slots:['topper','eyes','nose','mouth','clothes'],colors:['red','purple','yellow','blue','green'],limit:10}} as const;
export const CAKES={beginner:{layers:1,beltMs:0,capacity:1,target:5,mistakeLimit:3},intermediate:{layers:2,beltMs:1200,capacity:3,target:5,mistakeLimit:3},advanced:{layers:3,beltMs:800,capacity:3,target:6,mistakeLimit:3}} as const;
export const PAN_OPTIONS=['round','square','heart'] as const;
export const BATTER_OPTIONS=['vanilla','chocolate','strawberry'] as const;
export const FILLING_OPTIONS=['red','green','white'] as const;
export const ICING_OPTIONS=['none',...BATTER_OPTIONS] as const;
export const TOPPING_OPTIONS=['none','sprinkles','star candy','heart candy'] as const;
export const BELT_SLOTS=6;
export const RANK={bestRatio:1.5,middleRatio:2.5,shopBestRatio:.4,shopMiddleRatio:.7,beginnerGuessBenchmark:6};
export const UI={minTarget:44,timerTickMs:1000,msPerSecond:1000,maxSeed:4294967295};
export const AUDIO={volume:.06,duration:.13,floorVolume:.001,frequencies:{tap:440,match:660,win:880,wrong:220}};
export const PREFS_KEY='plum-plaza:prefs:v1';

export const GLAZE_CHANCE=.5;
