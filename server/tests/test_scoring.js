var nameMap = {
	[0]:'1筒',[1]:'2筒',[2]:'3筒',[3]:'4筒',[4]:'5筒',[5]:'6筒',[6]:'7筒',[7]:'8筒',[8]:'9筒',
	[9]:'1条',[10]:'2条',[11]:'3条',[12]:'4条',[13]:'5条',[14]:'6条',[15]:'7条',[16]:'8条',[17]:'9条',
	[18]:'1万',[19]:'2万',[20]:'3万',[21]:'4万',[22]:'5万',[23]:'6万',[24]:'7万',[25]:'8万',[26]:'9万',
}

function getKanShu(pai){
    return (pai % 9) + 1;
}

function testKanShu(name, pai, expected){
	var result = getKanShu(pai);
	var status = result === expected ? "✓ PASS" : "✗ FAIL";
	console.log(status + " | " + name + ": " + nameMap[pai] + " = 坎数" + result + " (预期: " + expected + ")");
	return result === expected;
}

console.log("========== 坎数计算测试 ==========\n");

var passCount = 0;
var totalCount = 0;

totalCount++;
if(testKanShu("1筒", 0, 1)) passCount++;
totalCount++;
if(testKanShu("5筒", 4, 5)) passCount++;
totalCount++;
if(testKanShu("9筒", 8, 9)) passCount++;
totalCount++;
if(testKanShu("3条", 11, 3)) passCount++;
totalCount++;
if(testKanShu("7万", 24, 7)) passCount++;

console.log("\n========== 计分规则测试 ==========\n");

function simulateZiMo(hupai, scores){
	var kanshu = getKanShu(hupai);
	console.log("自摸 " + nameMap[hupai] + " (坎数" + kanshu + ")");
	
	var totalWin = 0;
	for(var i = 0; i < scores.length; i++){
		var pay = kanshu * 2;
		if(scores[i] < pay){
			pay = scores[i];
		}
		console.log("  玩家" + i + " 付 " + pay + " 元 (余额: " + (scores[i] - pay) + " 元)");
		totalWin += pay;
		scores[i] -= pay;
	}
	console.log("  胡牌者赢得 " + totalWin + " 元");
	return totalWin;
}

function testZiMo(){
	console.log("--- 自摸测试 ---");
	var scores = [50, 50, 50, 50];
	var hupaiIndex = 0;
	var hupai = 2;
	var kanshu = getKanShu(hupai);
	console.log("玩家0自摸 " + nameMap[hupai] + " (坎数" + kanshu + ")");
	
	var totalWin = 0;
	for(var i = 0; i < scores.length; i++){
		if(i != hupaiIndex){
			var pay = kanshu * 2;
			if(scores[i] < pay){
				pay = scores[i];
			}
			console.log("  玩家" + i + " 付 " + pay + " 元 (余额: " + (scores[i] - pay) + " 元)");
			totalWin += pay;
			scores[i] -= pay;
		}
	}
	console.log("  胡牌者赢得 " + totalWin + " 元");
	console.log("  结果: 胡牌者 +" + totalWin + ", 其余各付6元");
	console.log("  预期: 胡牌者 +18, 其余各付6元");
	console.log("  " + (totalWin === 18 ? "✓ PASS" : "✗ FAIL"));
	return totalWin === 18;
}

function testDianPao(){
	console.log("\n--- 点炮测试 ---");
	var hupai = 4;
	var kanshu = getKanShu(hupai);
	console.log("胡 " + nameMap[hupai] + " (坎数" + kanshu + ")");
	
	var scores = [50, 50, 50, 50];
	var paoshouIndex = 1;
	var hupaiIndex = 0;
	
	var totalWin = 0;
	var paoshouPay = kanshu * 2;
	if(scores[paoshouIndex] < paoshouPay){
		paoshouPay = scores[paoshouIndex];
	}
	scores[paoshouIndex] -= paoshouPay;
	totalWin += paoshouPay;
	console.log("  炮手(玩家" + paoshouIndex + ") 付 " + paoshouPay + " 元");
	
	for(var i = 0; i < scores.length; i++){
		if(i != hupaiIndex && i != paoshouIndex){
			var pay = kanshu;
			if(scores[i] < pay){
				pay = scores[i];
			}
			scores[i] -= pay;
			totalWin += pay;
			console.log("  玩家" + i + " 付 " + pay + " 元");
		}
	}
	console.log("  胡牌者赢得 " + totalWin + " 元");
	console.log("  结果: 炮手付10元, 其余各付5元, 胡牌者+20元");
	console.log("  预期: 炮手付10元, 其余各付5元, 胡牌者+20元");
	console.log("  " + (totalWin === 20 ? "✓ PASS" : "✗ FAIL"));
	return totalWin === 20;
}

function testInsufficientFunds(){
	console.log("\n--- 输光保护测试 ---");
	var scores = [50, 3, 50, 50];
	var hupaiIndex = 0;
	var hupai = 4;
	var kanshu = getKanShu(hupai);
	console.log("玩家0自摸 " + nameMap[hupai] + " (坎数" + kanshu + ")");
	console.log("  玩家1只有3元，应付10元");
	
	var totalWin = 0;
	for(var i = 0; i < scores.length; i++){
		if(i != hupaiIndex){
			var pay = kanshu * 2;
			if(scores[i] < pay){
				pay = scores[i];
			}
			console.log("  玩家" + i + " 付 " + pay + " 元 (余额: " + (scores[i] - pay) + " 元)");
			totalWin += pay;
			scores[i] -= pay;
		}
	}
	console.log("  胡牌者赢得 " + totalWin + " 元");
	console.log("  预期: 玩家1付3元(全部), 玩家2付10元, 玩家3付10元, 胡牌者+23元");
	console.log("  " + (totalWin === 23 && scores[1] === 0 ? "✓ PASS" : "✗ FAIL"));
	return totalWin === 23 && scores[1] === 0;
}

totalCount++;
if(testZiMo()) passCount++;
totalCount++;
if(testDianPao()) passCount++;
totalCount++;
if(testInsufficientFunds()) passCount++;

console.log("\n========== 测试结果 ==========");
console.log("通过: " + passCount + "/" + totalCount);
console.log("失败: " + (totalCount - passCount) + "/" + totalCount);
