import {expect,test} from 'vitest';
import {mulberry32,shuffle} from '../../src/core/rng';
test('seeded shuffle is repeatable and preserves the input',()=>{const a=[1,2,3,4];expect(shuffle(a,mulberry32(9))).toEqual(shuffle(a,mulberry32(9)));expect(a).toEqual([1,2,3,4]);expect([...shuffle(a,mulberry32(8))].sort()).toEqual(a);});
