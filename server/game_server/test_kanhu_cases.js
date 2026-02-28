var mjutils = require('./mjutils');

// 牌的编号：筒 0-8, 条 9-17, 万 18-26, 字牌 27-33
// 筒: 1筒=0, 2筒=1, 3筒=2, 4筒=3, 5筒=4, 6筒=5, 7筒=6, 8筒=7, 9筒=8
// 条: 1条=9, 2条=10, 3条=11, 4条=12, 5条=13, 6条=14, 7条=15, 8条=16, 9条=17
// 万: 1万=18, 2万=19, 3万=20, 4万=21, 5万=22, 6万=23, 7万=24, 8万=25, 9万=26

function paiName(p) {
    if (p < 9) return (p + 1) + '筒';
    if (p < 18) return (p - 8) + '条';
    if (p < 27) return (p - 17) + '万';
    if (p == 27) return '东';
    if (p == 28) return '南';
    return '字' + p;
}

function testCase(name, holds, pengs, angangs, diangangs, wangangs, targetPai, expected) {
    var seatData = {
        holds: holds,
        pengs: pengs || [],
        angangs: angangs || [],
        diangangs: diangangs || [],
        wangangs: wangangs || [],
        chis: [],
        countMap: {},
        que: 3,
        tingMap: {}
    };

    for (var i = 0; i < holds.length; i++) {
        var pai = holds[i];
        seatData.countMap[pai] = (seatData.countMap[pai] || 0) + 1;
    }

    var result = mjutils.checkKanHu(seatData, targetPai);
    var status = result === expected ? '✓' : '✗';
    
    var mingMianziCount = (pengs ? pengs.length : 0) + (diangangs ? diangangs.length : 0) + (angangs ? angangs.length : 0) + (wangangs ? wangangs.length : 0);
    var neededMianziCount = 4 - mingMianziCount;
    
    console.log(status + ' ' + name);
    console.log('  手牌(' + holds.length + '张): ' + holds.map(paiName).join(' '));
    if (pengs && pengs.length > 0) console.log('  碰: ' + pengs.map(paiName).join(' '));
    if (diangangs && diangangs.length > 0) console.log('  明杠: ' + diangangs.map(paiName).join(' '));
    console.log('  胡: ' + paiName(targetPai));
    console.log('  明面子: ' + mingMianziCount + ', 需要暗面子: ' + neededMianziCount);
    console.log('  胡后: ' + (holds.length + 1) + '张, 期望: ' + (3 * neededMianziCount + 2) + '张');
    console.log('  结果: 期望=' + expected + ', 实际=' + result);
    console.log('');
    
    return result === expected;
}

console.log('=== 坎胡算法测试 ===\n');

var passed = 0;
var total = 0;

// 1. 1 2 3 4 5 6 7 8 9筒，1 3筒 ，2 2万，胡2筒，对
total++;
if (testCase('测试1: 123456789筒+13筒+22万，胡2筒',
    [0,1,2,3,4,5,6,7,8, 0,2, 18,18],
    null, null, null, null,
    1,
    true)) passed++;

// 2. 1 2 3 4 5 6 7 8 9筒，2 4筒，2 2万，胡3筒，不对
total++;
if (testCase('测试2: 123456789筒+24筒+22万，胡3筒',
    [0,1,2,3,4,5,6,7,8, 1,3, 18,18],
    null, null, null, null,
    2,
    false)) passed++;

// 3. 1 2 3 3 5 6 7 8筒，1 2 3 4 4万，胡4筒，对
total++;
if (testCase('测试3: 12335678筒+12344万，胡4筒',
    [0,1,2,2,4,5,6,7, 18,19,20,21,21],
    null, null, null, null,
    3,
    true)) passed++;

// 4. 1 1 2 2 3 4 4筒，1 2 3 4 5 6万，胡3筒，不对
total++;
if (testCase('测试4: 1122344筒+123456万，胡3筒',
    [0,0,1,1,2,3,3, 18,19,20,21,22,23],
    null, null, null, null,
    2,
    false)) passed++;

// 5. 1 1 1 1 3 4 5 6 7 8 9筒，1 1万，胡2筒，对
total++;
if (testCase('测试5: 11113456789筒+11万，胡2筒',
    [0,0,0,0, 2,3,4,5,6,7,8, 18,18],
    null, null, null, null,
    1,
    true)) passed++;

// 6. 2 3 3 4 5筒，1 2 3 4 5 6 7 7万，胡4筒，不对
total++;
if (testCase('测试6: 23345筒+12345677万，胡4筒',
    [1,2,2,3,4, 18,19,20,21,22,23,24,24],
    null, null, null, null,
    3,
    false)) passed++;

// 7. 6 7 7 8 9筒，1 2 3 4 5 6 7 7万，胡8筒，不对
total++;
if (testCase('测试7: 67789筒+12345677万，胡8筒',
    [5,6,6,7,8, 18,19,20,21,22,23,24,24],
    null, null, null, null,
    7,
    false)) passed++;

// 8. 7 7 7 9筒，1 2 3 4 5 6 7 8 9万，胡8筒，不对
total++;
if (testCase('测试8: 7779筒+123456789万，胡8筒',
    [6,6,6,8, 18,19,20,21,22,23,24,25,26],
    null, null, null, null,
    7,
    false)) passed++;

// 9. 2 2 2 2筒（明杠）4 5 6 7 7筒 2 3 4 6 8条，胡7条，对
// 手牌: 4筒=3, 5筒=4, 6筒=5, 7筒=6, 7筒=6
//       2条=10, 3条=11, 4条=12, 6条=14, 8条=16
// 胡7条=15
total++;
if (testCase('测试9: 明杠2222筒+45677筒+23468条，胡7条',
    [3,4,5,6,6, 10,11,12,14,16],  // 4,5,6,7,7筒 + 2,3,4,6,8条
    null, null, [1], null,  // 明杠2筒
    15,  // 胡7条
    true)) passed++;

// 10. 南南南（碰）5 5条 1 2 3 3 4 5 5 7万，胡6万，对
// 手牌: 5条=13, 5条=13
//       1万=18, 2万=19, 3万=20, 3万=20, 4万=21, 5万=22, 5万=22, 7万=24
// 胡6万=23
total++;
if (testCase('测试10: 碰南+55条+12334557万，胡6万',
    [13,13, 18,19,20,20,21,22,22,24],  // 5,5条 + 1,2,3,3,4,5,5,7万
    [28],  // 碰南
    null, null, null,
    23,  // 胡6万
    true)) passed++;

console.log('=== 测试结果 ===');
console.log('通过: ' + passed + '/' + total);
