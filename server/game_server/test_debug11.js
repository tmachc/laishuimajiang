// 调试测试2和测试4
var mjutils = require('./mjutils');

function parseHand(handStr) {
    var holds = [];
    var parts = handStr.split('，');
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i].trim();
        if (part.indexOf('筒') >= 0) {
            var nums = part.replace('筒', '');
            for (var j = 0; j < nums.length; j++) {
                holds.push(parseInt(nums[j]) - 1);
            }
        } else if (part.indexOf('条') >= 0) {
            var nums = part.replace('条', '');
            for (var j = 0; j < nums.length; j++) {
                holds.push(parseInt(nums[j]) - 1 + 9);
            }
        } else if (part.indexOf('万') >= 0) {
            var nums = part.replace('万', '');
            for (var j = 0; j < nums.length; j++) {
                holds.push(parseInt(nums[j]) - 1 + 18);
            }
        }
    }
    return holds;
}

function createSeatData(holds) {
    var countMap = {};
    for (var i = 0; i < holds.length; i++) {
        var pai = holds[i];
        countMap[pai] = (countMap[pai] || 0) + 1;
    }
    return {
        holds: holds,
        countMap: countMap,
        tingMap: {}
    };
}

function getPaiName(id) {
    if (id >= 0 && id <= 8) return (id + 1) + '筒';
    if (id >= 9 && id <= 17) return (id - 8) + '条';
    if (id >= 18 && id <= 26) return (id - 17) + '万';
    return '?';
}

// 测试2: 123456789筒，24筒，22万 胡3筒
console.log('========== 测试2 ==========');
var hand2 = parseHand('123456789筒，24筒，22万');
var target2 = 2; // 3筒
var seatData2 = createSeatData(hand2);

console.log('手牌:', hand2.map(getPaiName));
console.log('待胡:', getPaiName(target2));

var result2 = mjutils.checkKanHu(seatData2, target2);
console.log('结果:', result2 ? '胡' : '不胡');
console.log('预期: 不胡');

// 分析
console.log('\n分析:');
var countMap2 = {};
for (var i = 0; i < hand2.length; i++) {
    countMap2[hand2[i]] = (countMap2[hand2[i]] || 0) + 1;
}
countMap2[target2] = (countMap2[target2] || 0) + 1;

console.log('胡3筒后countMap:');
for (var k in countMap2) {
    console.log('  ' + getPaiName(parseInt(k)) + ': ' + countMap2[k] + '张');
}

// 测试4: 1122344筒，123456万 胡3筒
console.log('\n========== 测试4 ==========');
var hand4 = parseHand('1122344筒，123456万');
var target4 = 2; // 3筒
var seatData4 = createSeatData(hand4);

console.log('手牌:', hand4.map(getPaiName));
console.log('待胡:', getPaiName(target4));

var result4 = mjutils.checkKanHu(seatData4, target4);
console.log('结果:', result4 ? '胡' : '不胡');
console.log('预期: 不胡');

// 分析
console.log('\n分析:');
var countMap4 = {};
for (var i = 0; i < hand4.length; i++) {
    countMap4[hand4[i]] = (countMap4[hand4[i]] || 0) + 1;
}
countMap4[target4] = (countMap4[target4] || 0) + 1;

console.log('胡3筒后countMap:');
for (var k in countMap4) {
    console.log('  ' + getPaiName(parseInt(k)) + ': ' + countMap4[k] + '张');
}
