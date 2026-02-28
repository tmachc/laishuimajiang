// 坎胡测试脚本
var mjutils = require('./mjutils');

// 牌ID映射
// 筒子: 0-8 (1筒-9筒)
// 条子: 9-17 (1条-9条)
// 万子: 18-26 (1万-9万)

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

// 转换字符串牌型到ID
function parsePai(str) {
    var num = parseInt(str);
    if (str.indexOf('筒') >= 0) return num - 1; // 1筒=0
    if (str.indexOf('条') >= 0) return num - 1 + 9; // 1条=9
    if (str.indexOf('万') >= 0) return num - 1 + 18; // 1万=18
    return -1;
}

// 解析手牌字符串，如 "123456789筒，13筒，22万"
function parseHand(handStr) {
    var holds = [];
    var parts = handStr.split('，');
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i].trim();
        if (part.indexOf('筒') >= 0) {
            var nums = part.replace('筒', '');
            for (var j = 0; j < nums.length; j++) {
                holds.push(parseInt(nums[j]) - 1); // 1筒=0
            }
        } else if (part.indexOf('条') >= 0) {
            var nums = part.replace('条', '');
            for (var j = 0; j < nums.length; j++) {
                holds.push(parseInt(nums[j]) - 1 + 9); // 1条=9
            }
        } else if (part.indexOf('万') >= 0) {
            var nums = part.replace('万', '');
            for (var j = 0; j < nums.length; j++) {
                holds.push(parseInt(nums[j]) - 1 + 18); // 1万=18
            }
        }
    }
    return holds;
}

// 解析待胡牌
function parseTargetPai(str) {
    var num = parseInt(str);
    if (str.indexOf('筒') >= 0) return num - 1;
    if (str.indexOf('条') >= 0) return num - 1 + 9;
    if (str.indexOf('万') >= 0) return num - 1 + 18;
    return -1;
}

// 运行测试
function runTest(name, handStr, targetStr, expected) {
    var holds = parseHand(handStr);
    var targetPai = parseTargetPai(targetStr);
    var seatData = createSeatData(holds);
    
    var result = mjutils.checkKanHu(seatData, targetPai);
    var passed = result === expected;
    
    console.log('-------------------');
    console.log('测试: ' + name);
    console.log('手牌: ' + handStr + ' (共' + holds.length + '张)');
    console.log('待胡: ' + targetStr + ' (ID:' + targetPai + ')');
    console.log('预期: ' + (expected ? '胡' : '不胡'));
    console.log('实际: ' + (result ? '胡' : '不胡'));
    console.log('结果: ' + (passed ? '✅ 通过' : '❌ 失败'));
    
    return passed;
}

console.log('========== 坎胡算法测试 ==========\n');

var tests = [
    { name: '测试1', hand: '123456789筒，13筒，22万', target: '2筒', expected: true },
    { name: '测试2', hand: '123456789筒，24筒，22万', target: '3筒', expected: false },
    { name: '测试3', hand: '12335678筒，12344万', target: '4筒', expected: true },
    { name: '测试4', hand: '1122344筒，123456万', target: '3筒', expected: false },
    { name: '测试5', hand: '11113456789筒，11万', target: '2筒', expected: true },
    { name: '测试6', hand: '23345筒，12345677万', target: '4筒', expected: false },
    { name: '测试7', hand: '67789筒，12345677万', target: '8筒', expected: false },
    { name: '测试8', hand: '7779筒，123456789万', target: '8筒', expected: false }
];

var passed = 0;
var failed = 0;

for (var i = 0; i < tests.length; i++) {
    var t = tests[i];
    if (runTest(t.name, t.hand, t.target, t.expected)) {
        passed++;
    } else {
        failed++;
    }
}

console.log('\n========== 测试结果 ==========');
console.log('通过: ' + passed + '/' + tests.length);
console.log('失败: ' + failed + '/' + tests.length);
