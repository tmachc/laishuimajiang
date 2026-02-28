// 调试测试2和测试4的middleCount
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

// 创建暗牌countMap
var anCountMap2 = {};
for(var k in seatData2.countMap){
    anCountMap2[k] = seatData2.countMap[k];
}
anCountMap2[target2] = (anCountMap2[target2] || 0) + 1;

var tmpAnSeatData2 = { countMap: anCountMap2 };

// 检查各种顺子方式
var middleCount2 = 0;

// 检查 (1-2-3) - 作为右边缘
console.log('检查 (1-2-3):');
console.log('  1筒:', anCountMap2[0] || 0);
console.log('  2筒:', anCountMap2[1] || 0);
console.log('  3筒:', anCountMap2[2] || 0);
if(anCountMap2[0] >= 1 && anCountMap2[1] >= 1 && anCountMap2[2] >= 1){
    console.log('  ✅ 可以组成 (1-2-3)');
    middleCount2++;
} else {
    console.log('  ❌ 无法组成');
}

// 检查 (2-3-4) - 作为中间
console.log('检查 (2-3-4):');
console.log('  2筒:', anCountMap2[1] || 0);
console.log('  3筒:', anCountMap2[2] || 0);
console.log('  4筒:', anCountMap2[3] || 0);
if(anCountMap2[1] >= 1 && anCountMap2[2] >= 1 && anCountMap2[3] >= 1){
    console.log('  ✅ 可以组成 (2-3-4)');
    middleCount2++;
} else {
    console.log('  ❌ 无法组成');
}

// 检查 (3-4-5) - 作为左边缘
console.log('检查 (3-4-5):');
console.log('  3筒:', anCountMap2[2] || 0);
console.log('  4筒:', anCountMap2[3] || 0);
console.log('  5筒:', anCountMap2[4] || 0);
if(anCountMap2[2] >= 1 && anCountMap2[3] >= 1 && anCountMap2[4] >= 1){
    console.log('  ✅ 可以组成 (3-4-5)');
    middleCount2++;
} else {
    console.log('  ❌ 无法组成');
}

console.log('\nmiddleCount:', middleCount2);
console.log('预期: >1 种（不是坎胡）');
