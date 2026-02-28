// 坎胡测试脚本 - 调试版3
var mjutils = require('./mjutils');

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

function getPaiName(id) {
    if (id >= 0 && id <= 8) return (id + 1) + '筒';
    if (id >= 9 && id <= 17) return (id - 8) + '条';
    if (id >= 18 && id <= 26) return (id - 17) + '万';
    return '?';
}

// 调试测试1
console.log('========== 调试测试1 ==========');
var hand1 = parseHand('123456789筒，13筒，22万');
var target1 = 1; // 2筒
var seatData1 = createSeatData(hand1);
console.log('手牌:', hand1.map(getPaiName));
console.log('待胡:', getPaiName(target1));
console.log('countMap:', JSON.stringify(seatData1.countMap));

// 检查各个条件
console.log('\n--- 条件检查 ---');

// 胡后countMap
var tmpCountMap = {};
for (var k in seatData1.countMap) {
    tmpCountMap[k] = seatData1.countMap[k];
}
tmpCountMap[target1] = (tmpCountMap[target1] || 0) + 1;
console.log('胡后countMap:', JSON.stringify(tmpCountMap));

// checkCanBeMiddle: 需要prev和next各>=1
var prev = target1 - 1; // 1筒
var next = target1 + 1; // 3筒
console.log('1筒数量:', tmpCountMap[prev] || 0);
console.log('3筒数量:', tmpCountMap[next] || 0);
console.log('canBeMiddle:', (tmpCountMap[prev] >= 1 && tmpCountMap[next] >= 1));

// checkCanBeJiang: 需要count>=1
console.log('2筒数量:', tmpCountMap[target1]);
console.log('canBeJiang:', tmpCountMap[target1] >= 1);

// checkCanBeLeftEdge: 需要next1和next2各>=1
var next1 = target1 + 1; // 3筒
var next2 = target1 + 2; // 4筒
console.log('3筒数量:', tmpCountMap[next1] || 0);
console.log('4筒数量:', tmpCountMap[next2] || 0);
console.log('canBeLeftEdge:', (tmpCountMap[next1] >= 1 && tmpCountMap[next2] >= 1));

// checkCanBeRightEdge: 需要prev1和prev2各>=1
var prev1 = target1 - 1; // 1筒
var prev2 = target1 - 2; // 0筒(9筒)
console.log('1筒数量:', tmpCountMap[prev1] || 0);
console.log('0筒数量:', tmpCountMap[prev2] || 0);
console.log('canBeRightEdge:', (tmpCountMap[prev1] >= 1 && tmpCountMap[prev2] >= 1));

// checkCanBeKezi: 需要count>=2
console.log('canBeKezi:', tmpCountMap[target1] >= 2);

// 最终结果
var result1 = mjutils.checkKanHu(seatData1, target1);
console.log('\n最终结果:', result1 ? '胡' : '不胡');
