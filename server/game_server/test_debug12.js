// 检查测试2的多种胡法
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

// 测试2: 123456789筒，24筒，22万
console.log('========== 测试2：检查所有可能的胡牌 ==========');
var hand2 = parseHand('123456789筒，24筒，22万');
var seatData2 = createSeatData(hand2);

console.log('手牌:', hand2.map(getPaiName));

// 检查能胡哪些牌
var huList = [];
for (var i = 0; i < 27; i++) {
    if (mjutils.checkKanHu(seatData2, i)) {
        huList.push(getPaiName(i));
    }
}

console.log('\n可以坎胡的牌:', huList);
console.log('胡牌数量:', huList.length);

if (huList.length > 1) {
    console.log('有多种胡法，不是坎胡');
} else if (huList.length === 1) {
    console.log('只有一种胡法，是坎胡');
} else {
    console.log('不能胡');
}
